import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const readJson = async (path) => JSON.parse(await read(path));

test('Release 16.11 publishes the approved Donovan and Henke roster', async () => {
  const providers = await readJson('src/data/providers.json');
  const visible = providers.filter((provider) => provider.visible).sort((a, b) => a.order - b.order);

  assert.deepEqual(visible.map((provider) => provider.id), ['william-donovan', 'jordan-henke']);
  assert.equal(visible[0].photo, '');
  assert.equal(visible[0].imageType, 'illustration');

  const henke = visible[1];
  assert.equal(henke.name, 'Dr. Jordan Henke');
  assert.equal(henke.credentials, 'DDS');
  assert.equal(henke.photo, '/images/dr-jordan-henke-family.webp');
  assert.equal(henke.photoCaption, 'Henke Family');
  assert.match(henke.biography.join('\n'), /University of Mary/);
  assert.match(henke.biography.join('\n'), /University of Colorado School of Dental Medicine/);
  assert.match(henke.biography.join('\n'), /Naval Reserves/);
  assert.match(henke.biography.join('\n'), /wife, Mia, and their four children/);
  assert.doesNotMatch(JSON.stringify(providers), /Koolkin/i);
});

test('Release 16.11 renders the shared provider data in both concepts', async () => {
  const [classic, modern, classicLayout, modernLayout, css] = await Promise.all([
    read('src/pages/about.astro'),
    read('src/pages/modern/team.astro'),
    read('src/layouts/BaseLayout.astro'),
    read('src/layouts/ModernLayout.astro'),
    read('src/styles/release-16-11.css')
  ]);

  assert.match(classic, /visibleProviders\.map/);
  assert.match(classic, /provider\.photoCaption/);
  assert.match(classic, /providerSrcSet/);
  assert.match(modern, /visibleProviders\.map/);
  assert.match(modern, /provider\.photoCaption/);
  assert.match(modern, /providerSrcSet/);
  assert.match(classicLayout, /release-16-11\.css/);
  assert.match(modernLayout, /release-16-10\.css[\s\S]*release-16-11\.css/);
  assert.match(css, /modern-provider-list/);
  assert.match(css, /provider-photo-caption/);
});

test('Release 16.11 clears only the provider-roster readiness item', async () => {
  const [contentStatus, launchReadiness, evidence] = await Promise.all([
    readJson('src/data/content-status.json'),
    readJson('src/data/launch-readiness.json'),
    read('docs/evidence/provider-roster-henke-2026-08-04.md')
  ]);

  const rosterBlocker = contentStatus.launchBlockers.find((item) => item.id === 'provider-roster');
  const rosterEvidence = launchReadiness.requiredEvidence.find((item) => item.id === 'provider-roster');

  assert.equal(rosterBlocker.status, 'verified');
  assert.equal(rosterEvidence.status, 'verified');
  assert.equal(rosterEvidence.evidenceRef, 'docs/evidence/provider-roster-henke-2026-08-04.md');
  assert.match(evidence, /Dr\. Jordan Henke/);
  assert.match(evidence, /Henke Family/);

  for (const id of ['services', 'insurance-payment', 'urgent-care-wording', 'production-integrations']) {
    assert.notEqual(contentStatus.launchBlockers.find((item) => item.id === id)?.status, 'verified');
  }
});
