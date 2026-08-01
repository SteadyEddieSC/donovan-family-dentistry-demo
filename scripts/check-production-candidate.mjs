import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readText = (relative) => readFile(path.join(repositoryRoot, relative), 'utf8');
const readJson = async (relative) => JSON.parse(await readText(relative));

const [site, status, robots, headers, envExample] = await Promise.all([
  readJson('src/data/site.json'),
  readJson('src/data/content-status.json'),
  readText('public/robots.txt'),
  readText('public/_headers'),
  readText('.env.example')
]);

const failures = [];
const requiredBlockers = [
  'provider-roster',
  'services',
  'insurance-payment',
  'urgent-care-wording',
  'production-integrations'
];
const blockerIds = status.launchBlockers.map((item) => item.id);

if (site.previewMode !== true) failures.push('site.previewMode must remain true until all launch blockers are genuinely verified.');
if (site.socialImage !== '/images/donovan-social-card.webp') failures.push('site.socialImage must use the generated 1200x630 production-candidate social card.');
if (!robots.includes('Disallow: /')) failures.push('robots.txt must block crawling during the private preview.');
if (!headers.includes('X-Robots-Tag: noindex, nofollow, noarchive')) failures.push('Cloudflare headers must keep the preview noindex policy.');
if (!envExample.includes('PUBLIC_ADMIN_INQUIRY_ENABLED=false')) failures.push('The administrative inquiry must remain disabled by default.');

for (const blocker of requiredBlockers) {
  if (!blockerIds.includes(blocker)) failures.push(`Launch blocker ${blocker} is missing from the readiness register.`);
}
for (const item of status.launchBlockers) {
  if (item.status === 'verified') failures.push(`Launch blocker ${item.id} cannot be marked verified without owner/configuration evidence.`);
  if (!item.replacementNeeded) failures.push(`Launch blocker ${item.id} must explain the evidence needed to clear it.`);
}

for (const requiredDocument of [
  'docs/release-14-production-candidate.md',
  'docs/release-15-launch-readiness.md'
]) {
  try {
    await access(path.join(repositoryRoot, requiredDocument));
  } catch {
    failures.push(`${requiredDocument} is missing.`);
  }
}

if (failures.length > 0) {
  console.error('Production-candidate safety gate failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Production-candidate safety gate passed with ${status.launchBlockers.length} enforced launch blocker(s) and preview indexing disabled.`);
