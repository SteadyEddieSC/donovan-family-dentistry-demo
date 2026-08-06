import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const read = (file) => readFile(file, 'utf8');
const readJson = async (file) => JSON.parse(await read(file));

test('Release 17.1 preserves preview and production launch boundaries', async () => {
  const [site, astro, headers, robots] = await Promise.all([
    readJson('src/data/site.json'),
    read('astro.config.mjs'),
    read('public/_headers'),
    read('src/pages/robots.txt.ts')
  ]);
  assert.equal(site.previewMode, true);
  assert.equal(site.productionUrl, 'https://www.donovanfamilydentistry.com');
  assert.match(astro, /donovan-family-dentistry-demo\.pages\.dev/);
  assert.match(headers, /X-Robots-Tag: noindex, nofollow, noarchive/);
  assert.match(robots, /site\.previewMode/);
  assert.match(robots, /Disallow: \/\\n/);
});

test('Classic new-patient page is a public route and Modern remains a noindex demo', async () => {
  const [routes, sitemap, modernLayout, header, footer] = await Promise.all([
    read('scripts/validation-routes.mjs'),
    read('src/pages/sitemap.xml.ts'),
    read('src/layouts/ModernLayout.astro'),
    read('src/components/Header.astro'),
    read('src/components/Footer.astro')
  ]);
  for (const source of [routes, sitemap, header, footer]) assert.match(source, /\/new-patients\//);
  assert.match(modernLayout, /const forceNoIndex = true;/);
  assert.match(modernLayout, /includeBusinessSchema=\{false\}/);
  assert.doesNotMatch(sitemap, /'\/modern\//);
  assert.doesNotMatch(sitemap, /'\/review\//);
});

test('quality and security commands compose existing validation instead of replacing it', async () => {
  const pkg = await readJson('package.json');
  for (const name of [
    'check:seo', 'check:lighthouse', 'check:links', 'check:html',
    'check:structured-data', 'check:security', 'check:all'
  ]) assert.ok(pkg.scripts[name], `${name} must exist`);
  assert.match(pkg.scripts.prebuild, /check-production-candidate/);
  assert.match(pkg.scripts.prebuild, /materialize-assets/);
  assert.match(pkg.scripts.prebuild, /generate-responsive-images/);
  assert.match(pkg.scripts.prebuild, /patch-patient-form/);
});

test('Lighthouse thresholds match the approved stable quality floor', async () => {
  const config = await read('lighthouserc.cjs');
  assert.match(config, /'categories:seo': \['error', \{ minScore: 1 \}\]/);
  assert.match(config, /'categories:accessibility': \['error', \{ minScore: 0\.95 \}\]/);
  assert.match(config, /'categories:best-practices': \['error', \{ minScore: 0\.95 \}\]/);
  assert.match(config, /'categories:performance': \['error', \{ minScore: 0\.9 \}\]/);
  assert.match(config, /'cumulative-layout-shift': \['error', \{ maxNumericValue: 0\.1 \}\]/);
});

test('Dependabot covers npm and GitHub Actions without automatic merging', async () => {
  const config = await read('.github/dependabot.yml');
  assert.match(config, /package-ecosystem: npm/);
  assert.match(config, /package-ecosystem: github-actions/);
  assert.match(config, /update-types:[\s\S]*minor[\s\S]*patch/);
  assert.doesNotMatch(config, /auto-merge|automerge/i);
});

test('all GitHub Actions workflows use explicit permissions and immutable action pins', async () => {
  const directory = '.github/workflows';
  const files = (await readdir(directory)).filter((name) => /\.ya?ml$/i.test(name));
  assert.ok(files.length >= 4);
  for (const name of files) {
    const source = await read(path.join(directory, name));
    assert.match(source, /^permissions:/m, `${name} must declare permissions`);
    assert.doesNotMatch(source, /pull_request_target\s*:/, `${name} must not use pull_request_target`);
    for (const match of source.matchAll(/^\s*-?\s*uses:\s*([^\s#]+)(?:\s+#.*)?$/gm)) {
      if (match[1].startsWith('./')) continue;
      assert.match(match[1], /@[0-9a-f]{40}$/i, `${name} action must be pinned: ${match[1]}`);
    }
    if (/actions\/checkout@/i.test(source)) assert.match(source, /persist-credentials:\s*false/i, `${name} checkout must disable persisted credentials`);
  }
});

test('security exception register is empty and narrowly structured', async () => {
  const register = await readJson('config/security-exceptions.json');
  assert.deepEqual(register, { exceptions: [] });
  const gitleaks = await read('.gitleaks.toml');
  assert.match(gitleaks, /useDefault = true/);
  assert.doesNotMatch(gitleaks, /allowlist|paths|regexes/i);
});
