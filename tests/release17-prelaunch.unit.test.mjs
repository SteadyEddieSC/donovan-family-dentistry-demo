import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('..', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const readJson = async (path) => JSON.parse(await read(path));

const assertMissing = async (path) => {
  await assert.rejects(access(new URL(path, root)));
};

test('Release 17 preparation records the owner-confirmed Monday through Thursday hours', async () => {
  const site = await readJson('src/data/site.json');
  const openDays = site.hours.slice(0, 4);

  assert.deepEqual(openDays.map((item) => item.day), ['Monday', 'Tuesday', 'Wednesday', 'Thursday']);
  assert.ok(openDays.every((item) => item.hours === '8:00 AM-5:00 PM'));
  assert.ok(site.hours.slice(4).every((item) => item.hours === 'Closed'));
  assert.equal(site.productionUrl, 'https://www.donovanfamilydentistry.com');
  assert.equal(site.previewMode, true, 'prelaunch preparation must not enable indexing');
});

test('structured data derives opening hours from the shared office-hours source', async () => {
  const metadata = await read('src/components/SiteMetadata.astro');

  assert.match(metadata, /const openingHoursSpecification = site\.hours\.flatMap/);
  assert.match(metadata, /parseClockTime/);
  assert.doesNotMatch(metadata, /opens:\s*'07:30'/);
  assert.match(metadata, /openingHoursSpecification\n\s*}/);
});

test('Modern remains available as a future demo but is permanently noindex', async () => {
  const [site, modernLayout, sitemap, robots] = await Promise.all([
    readJson('src/data/site.json'),
    read('src/layouts/ModernLayout.astro'),
    read('src/pages/sitemap.xml.ts'),
    read('src/pages/robots.txt.ts')
  ]);

  assert.deepEqual(site.modernDemo, {
    enabled: true,
    path: '/modern/',
    indexable: false
  });
  assert.match(modernLayout, /forceNoIndex=\{true\}/);
  assert.match(modernLayout, /Future design demo\. Not the current public website\./);
  assert.doesNotMatch(sitemap, /'\/modern\//);
  assert.doesNotMatch(sitemap, /'\/review\//);
  assert.match(robots, /Disallow: \/modern\//);
  assert.match(robots, /Disallow: \/review\//);
});

test('robots policy stays closed before launch and switches through the explicit preview flag', async () => {
  const robots = await read('src/pages/robots.txt.ts');

  assert.match(robots, /site\.previewMode/);
  assert.match(robots, /Disallow: \/\\n/);
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Sitemap:/);
  await assertMissing('public/robots.txt');
});

test('Classic and Modern footer hours are rendered from the shared data file', async () => {
  const [classicFooter, modernLayout] = await Promise.all([
    read('src/components/Footer.astro'),
    read('src/layouts/ModernLayout.astro')
  ]);

  assert.match(classicFooter, /site\.hours\.filter/);
  assert.match(modernLayout, /site\.hours\.filter/);
  assert.doesNotMatch(`${classicFooter}\n${modernLayout}`, /7:30 AM/);
});
