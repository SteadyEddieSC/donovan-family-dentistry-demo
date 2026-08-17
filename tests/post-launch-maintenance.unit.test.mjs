import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateOfficeRollback } from '../scripts/validate-office-rollback.mjs';

const root = new URL('..', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('rollback validator accepts only an office update with office-managed paths', () => {
  assert.deepEqual(validateOfficeRollback('office update: revise site.json', ['src/data/site.json']), { ok: true });
  assert.deepEqual(validateOfficeRollback('office update: add photo', ['public/images/approved.webp']), { ok: true });
  assert.equal(validateOfficeRollback('release: update site', ['src/data/site.json']).ok, false);
  assert.equal(validateOfficeRollback('office update: revise workflow', ['.github/workflows/office-rollback.yml']).ok, false);
  assert.equal(validateOfficeRollback('office update: empty', []).ok, false);
});

test('production monitor defaults to the canonical site and retains explicit preview targeting', async () => {
  const [workflow, monitor, headers, finalizer, packageJson] = await Promise.all([
    read('.github/workflows/production-candidate-monitor.yml'),
    read('scripts/check-deployed-site.mjs'),
    read('public/_headers'),
    read('scripts/finalize-security-headers.mjs'),
    read('package.json')
  ]);
  assert.match(workflow, /default: https:\/\/donovanfamilydentistry\.com/);
  assert.match(workflow, /inputs\.site_url \|\| 'https:\/\/donovanfamilydentistry\.com'/);
  assert.match(monitor, /process\.env\.SITE_URL \|\| 'https:\/\/donovanfamilydentistry\.com'/);
  assert.match(monitor, /SKIP_PRODUCTION_DNS_CHECKS/);
  assert.match(monitor, /unsafe-eval/);
  assert.match(monitor, /strict-transport-security/);
  assert.match(monitor, /2_592_000/);
  assert.match(monitor, /includesubdomains/i);
  assert.match(monitor, /preload/i);
  assert.match(monitor, /\/_astro\//);
  assert.match(monitor, /max-age=31536000/);
  assert.match(monitor, /max-age=3600/);
  assert.match(monitor, /\/api\/administrative-inquiry/);
  assert.match(headers, /script-src[^\n]*'sha256-__BUILD_TIME_SCRIPT_HASHES__'/);
  assert.doesNotMatch(headers, /script-src[^;\n]*'unsafe-inline'/);
  assert.match(headers, /\/_astro\/\*\r?\n\s+Cache-Control: public, max-age=31536000, immutable/);
  assert.match(finalizer, /createHash\('sha256'\)/);
  assert.match(finalizer, /cspLine\.length > 2_000/);
  assert.match(packageJson, /finalize-security-headers\.mjs/);
});

test('office documentation matches the three-area public-repository editor boundary', async () => {
  const docs = `${await read('docs/office-cms-quickstart.md')}\n${await read('docs/owner-editing-guide.md')}`;
  assert.doesNotMatch(docs, /private repository|four editing areas|Dr\. Robert Koolkin|Modern page wording/i);
  assert.match(docs, /Current website quick updates/);
  assert.match(docs, /Dentist profiles/);
  assert.match(docs, /Services and patient forms/);
  assert.match(docs, /protected health information/i);
});

test('office content backup artifact includes the hidden Pages CMS configuration', async () => {
  const workflow = await read('.github/workflows/office-content-backup.yml');
  assert.match(workflow, /managed_files=\([\s\S]*\.pages\.yml/);
  assert.match(workflow, /include-hidden-files:\s*true/);
});
