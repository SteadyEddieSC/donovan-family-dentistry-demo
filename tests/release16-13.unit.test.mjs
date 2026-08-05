import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('..', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const readJson = async (path) => JSON.parse(await read(path));

test('Release 16.13 records the owner-confirmed two-daughter profile detail', async () => {
  const providers = await readJson('src/data/providers.json');
  const donovan = providers.find((provider) => provider.id === 'william-donovan');

  assert.ok(donovan, 'Dr. Donovan provider record is missing');
  const biography = donovan.biography.join(' ');
  const details = donovan.details.join(' ');
  assert.match(biography, /The couple has two daughters\./);
  assert.match(details, /two daughters/);
  assert.doesNotMatch(`${biography} ${details}`, /one daughter/);
});

test('Release 16.13 adds Classic-only separation between provider profiles', async () => {
  const [css, classicLayout, modernLayout] = await Promise.all([
    read('src/styles/release-16-13.css'),
    read('src/layouts/BaseLayout.astro'),
    read('src/layouts/ModernLayout.astro')
  ]);

  assert.match(css, /\.provider\s*\+\s*\.provider\s*\{/);
  assert.match(css, /margin-top:\s*clamp\(2\.5rem,\s*5vw,\s*4rem\)/);
  assert.match(classicLayout, /release-16-12\.css[\s\S]*release-16-13\.css/);
  assert.doesNotMatch(modernLayout, /release-16-13\.css/);
});
