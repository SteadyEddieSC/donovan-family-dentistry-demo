import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const readJson = async (path) => JSON.parse(await read(path));

test('Release 16.11 publishes the approved Donovan and Henke roster', async () => {
  const providers = await readJson('src/data/providers.json');
  const visible = providers.filter((provider) => provider.visible);

  assert.deepEqual(visible.map((provider) => provider.id), ['william-donovan', 'jordan-henke']);
  assert.equal(visible[0].photo, '/images/dr-william-donovan-photo-r16-12.webp');
  assert.equal(visible[1].photo, '/images/dr-jordan-henke-family-r16-12.webp');
  assert.equal(visible[1].photoCaption, '');
  assert.doesNotMatch(JSON.stringify(providers), /koolkins?|associate-dentist-template/i);
});

test('Current provider pages render shared data without hardcoded legacy imagery or captions', async () => {
  const [classic, modern, classicLayout, modernLayout] = await Promise.all([
    read('src/pages/about.astro'),
    read('src/pages/modern/team.astro'),
    read('src/layouts/BaseLayout.astro'),
    read('src/layouts/ModernLayout.astro')
  ]);

  assert.match(classic, /visibleProviders\.map/);
  assert.match(modern, /visibleProviders\.map/);
  assert.doesNotMatch(classic, /provider\.photoCaption/);
  assert.doesNotMatch(modern, /provider\.photoCaption/);
  assert.doesNotMatch(classic, /dr-william-donovan-family-480/);
  assert.doesNotMatch(modern, /dr-william-donovan-family-480/);
  assert.match(classicLayout, /release-16-11\.css[\s\S]*release-16-12\.css/);
  assert.match(modernLayout, /release-16-11\.css[\s\S]*release-16-12\.css/);
});

test('Release 16.11 keeps the supplied biography and local photographs', async () => {
  const [providers, manifest] = await Promise.all([
    readJson('src/data/providers.json'),
    readJson('.asset-source/manifest.json')
  ]);
  const henke = providers.find((provider) => provider.id === 'jordan-henke');

  assert.match(henke.biography.join(' '), /University of Mary/);
  assert.match(henke.biography.join(' '), /University of Colorado School of Dental Medicine/);
  assert.match(henke.biography.join(' '), /Naval Reserves/);
  assert.match(henke.biography.join(' '), /wife, Mia, and their four children/);

  const materializedTargets = new Set(manifest.map((asset) => `/${asset.target.replace(/^public\//, '')}`));
  assert.equal(materializedTargets.has(providers[0].photo), true);
  assert.equal(materializedTargets.has(providers[1].photo), true);
});
