import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function readJson(relativePath) {
  const absolutePath = path.join(repositoryRoot, relativePath);
  return JSON.parse(await readFile(absolutePath, 'utf8'));
}

const [site, contentStatus] = await Promise.all([
  readJson('src/data/site.json'),
  readJson('src/data/content-status.json')
]);

const ids = [
  ...contentStatus.verified.map((item) => item.id),
  ...contentStatus.launchBlockers.map((item) => item.id)
];
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

if (duplicateIds.length > 0) {
  console.error(`Launch-readiness register contains duplicate IDs: ${[...new Set(duplicateIds)].join(', ')}`);
  process.exit(1);
}

const unresolved = contentStatus.launchBlockers.filter((item) => item.status !== 'verified');

if (site.previewMode) {
  console.log(
    `Launch-readiness gate: preview mode is active with ${unresolved.length} documented blocker${unresolved.length === 1 ? '' : 's'}.`
  );
  process.exit(0);
}

if (unresolved.length > 0) {
  console.error('Public launch is blocked because the following content or operating items are unresolved:');
  for (const item of unresolved) {
    console.error(`- ${item.label} [${item.status}]: ${item.replacementNeeded}`);
  }
  console.error('Keep previewMode enabled or verify and update every blocking item before public promotion.');
  process.exit(1);
}

console.log('Launch-readiness gate passed: preview mode is disabled and no unresolved blockers remain.');
