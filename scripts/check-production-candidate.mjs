import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readText = (relative) => readFile(path.join(repositoryRoot, relative), 'utf8');
const readJson = async (relative) => JSON.parse(await readText(relative));

const [site, status, launchReadiness, robotsRoute, headers, envExample] = await Promise.all([
  readJson('src/data/site.json'),
  readJson('src/data/content-status.json'),
  readJson('src/data/launch-readiness.json'),
  readText('src/pages/robots.txt.ts'),
  readText('public/_headers'),
  readText('.env.example')
]);

const failures = [];
const productionPhase = launchReadiness.phase === 'production';
const headerBlocks = headers.split(/\r?\n\r?\n/);
const globalHeaderBlock = headerBlocks.find((block) => block.startsWith('/*')) ?? '';
const headerBlockFor = (route) => headerBlocks.find((block) => block.startsWith(route)) ?? '';

if (productionPhase && site.previewMode !== false) failures.push('Production phase requires site.previewMode to be false.');
if (!productionPhase && site.previewMode !== true) failures.push('Readiness phase requires site.previewMode to remain true.');
if (site.socialImage !== '/images/donovan-social-card.webp') failures.push('site.socialImage must use the generated 1200x630 production-candidate social card.');
if (!robotsRoute.includes('site.previewMode')) failures.push('robots.txt route must remain governed by the explicit preview-mode launch switch.');
if (!robotsRoute.includes("'User-agent: *\\nDisallow: /\\n'")) failures.push('robots.txt route must block all crawling during private preview.');
if (robotsRoute.includes("'Disallow: /modern/'") || robotsRoute.includes("'Disallow: /review/'")) failures.push('Noindex HTML must remain crawlable after launch so search engines can observe its page-level indexing rule.');
if (!robotsRoute.includes("'Allow: /'")) failures.push('robots.txt route must allow crawling after launch.');
if (!robotsRoute.includes('Sitemap:')) failures.push('robots.txt route must advertise the sitemap after launch.');
if (productionPhase) {
  if (globalHeaderBlock.includes('X-Robots-Tag: noindex, nofollow, noarchive')) failures.push('Production Classic routes must not inherit the global preview noindex header.');
  for (const route of ['/modern/*', '/review/*', '/api/*']) {
    if (!headerBlockFor(route).includes('X-Robots-Tag: noindex, nofollow, noarchive')) failures.push(`${route} must retain response-level noindex protection in production.`);
  }
  if (site.productionUrl !== launchReadiness.canonicalOrigin) failures.push('site.productionUrl must match the approved canonicalOrigin in production.');
} else if (!globalHeaderBlock.includes('X-Robots-Tag: noindex, nofollow, noarchive')) {
  failures.push('Readiness builds must keep the global preview noindex policy.');
}
if (!envExample.includes('PUBLIC_ADMIN_INQUIRY_ENABLED=false')) failures.push('The administrative inquiry must remain disabled by default.');

for (const item of status.launchBlockers) {
  if (!item?.id || !item?.label || !item?.status || !item?.replacementNeeded) {
    failures.push('Every remaining launch blocker must retain id, label, status, and replacementNeeded evidence guidance.');
  }
}

for (const requiredVerifiedId of [
  'provider-roster',
  'classic-content-approval',
  'insurance-network-status',
  'administrative-inquiry-deferred',
  'patient-form-layout'
]) {
  if (!status.verified.some((item) => item.id === requiredVerifiedId && item.status === 'verified')) {
    failures.push(`Verified readiness evidence ${requiredVerifiedId} is missing.`);
  }
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

console.log(`Production safety gate passed in ${productionPhase ? 'production' : 'readiness'} phase with ${status.launchBlockers.length} unresolved launch blocker(s), Classic content owner-approved, the administrative inquiry intentionally deferred, and Modern/review utilities protected by permanent noindex controls.`);
