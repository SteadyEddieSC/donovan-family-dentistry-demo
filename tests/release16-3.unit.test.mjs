import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Release 16.3 uses the owner-preferred shared horizontal logo', async () => {
  const layout = await read('src/layouts/ModernLayout.astro');
  const site = JSON.parse(await read('src/data/site.json'));

  assert.equal(site.logo, '/images/donovan-logo.svg');
  assert.match(layout, /const modernLogo = site\.logo/);
  assert.match(layout, /release-16-3\.css/);
  assert.equal((layout.match(/src=\{modernLogo\}/g) || []).length, 2);
  assert.equal((layout.match(/width="510" height="138"/g) || []).length, 2);
  assert.doesNotMatch(layout, /const modernLogo = '\/images\/donovan-sign-logo\.svg'/);
});

test('Release 16.3 gives the modern logo an explicit light surface without color filters', async () => {
  const css = await read('src/styles/release-16-3.css');
  const logo = await read('public/images/donovan-logo.svg');

  assert.match(css, /color-scheme: only light/);
  assert.match(css, /background-color: #ffffff !important/);
  assert.match(css, /border-radius: 1rem !important/);
  assert.match(css, /filter: none !important/);
  assert.match(css, /forced-color-adjust: none/);
  assert.match(css, /mix-blend-mode: normal/);

  assert.match(logo, /viewBox="0 0 510 138"/);
  assert.match(logo, /fill="#ffffff"[^>]*stroke="#006b93"/);
  assert.match(logo, /fill="#12233f"/);
  assert.match(logo, /fill="#72a928"/);
  assert.match(logo, /fill="#00749d"/);
  assert.match(logo, /color-scheme: only light/);
  assert.match(logo, /forced-color-adjust: none/);
  assert.doesNotMatch(logo, /<image/i);
});

test('Release 16.3 documentation records the visual decision and safety boundary', async () => {
  const release = await read('docs/release-16-3-shared-logo-dark-mode.md');
  const roadmap = await read('docs/roadmap.md');

  assert.match(release, /horizontal logo/i);
  assert.match(release, /dark mode/i);
  assert.match(release, /production DNS/i);
  assert.match(roadmap, /Release 16\.3/);
});
