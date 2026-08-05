import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readText = (relative) => readFile(path.join(repositoryRoot, relative), 'utf8');
const readJson = async (relative) => JSON.parse(await readText(relative));

const [site, status, robotsRoute, headers, envExample] = await Promise.all([
  readJson('src/data/site.json'),
  readJson('src/data/content-status.json'),
  readText('src/pages/robots.txt.ts'),
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
if (!robotsRoute.includes('site.previewMode')) failures.push('robots.txt route must remain governed by the explicit preview-mode launch switch.');
if (!robotsRoute.includes("'User-agent: *\\nDisallow: /\\n'")) failures.push('robots.txt route must block all crawling during private preview.');
if (!robotsRoute.includes("'Disallow: /modern/'")) failures.push('robots.txt route must exclude the retained Modern demo after launch.');
if (!robotsRoute.includes("'Disallow: /review/'")) failures.push('robots.txt route must exclude private review utilities after launch.');
if (!robotsRoute.includes('Sitemap:')) failures.push('robots.txt route must advertise the sitemap after launch.');
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

console.log(`Production-candidate safety gate passed with ${status.launchBlockers.length} enforced launch blocker(s), preview indexing disabled, and the future Modern demo excluded from indexing.`);
