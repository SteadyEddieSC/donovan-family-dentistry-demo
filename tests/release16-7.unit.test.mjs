import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Release 16.7 uses the exact active-logo green across modern accent surfaces', async () => {
  const [logo, css, layout] = await Promise.all([
    read('public/images/donovan-logo.svg'),
    read('src/styles/release-16-7.css'),
    read('src/layouts/ModernLayout.astro')
  ]);

  assert.match(logo, /fill="#72a928"/i);
  assert.match(css, /--modern-lime: #72a928/i);
  assert.match(css, /--modern-brand-green: #72a928/i);
  assert.match(css, /\.modern-contact-tile--featured/);
  assert.match(css, /\.modern-save-contact-card/);
  assert.match(css, /\.modern-value-icon/);
  assert.match(css, /\.modern-team-icon/);
  assert.match(css, /\.modern-section--deep \.modern-eyebrow/);
  assert.match(css, /@media \(forced-colors: active\)/);

  const release16_6 = layout.indexOf("release-16-6.css");
  const release16_7 = layout.indexOf("release-16-7.css");
  assert.ok(release16_6 >= 0 && release16_7 > release16_6);
});

test('Release 16.7 clearly explains downloading and importing the office contact', async () => {
  const [stack, contact, newPatients, layout] = await Promise.all([
    read('src/components/ContactActionStack.astro'),
    read('src/pages/modern/contact.astro'),
    read('src/pages/modern/new-patients/index.astro'),
    read('src/layouts/ModernLayout.astro')
  ]);

  for (const document of [stack, newPatients]) {
    assert.match(document, /Downloadable Contact Card/);
    assert.match(document, /open the file to import it/);
    assert.match(document, /href="\/donovan-family-dentistry\.vcf" download/);
  }

  assert.match(contact, /After it downloads, open the file once to import the office into your contacts/);
  assert.match(layout, /Download contact card/);
});

test('Release 16.7 remains local, static, and vendor-free', async () => {
  const css = await read('src/styles/release-16-7.css');
  const release = await read('docs/release-16-7-brand-green-contact-card.md');

  assert.doesNotMatch(css, /https?:\/\//i);
  assert.match(release, /no new account, API, script, library, analytics event, or paid service/i);
  assert.match(release, /does not change production DNS, TLS, email, indexing, inquiry delivery, scheduling, texting, payments, intake, or PHI handling/i);
});
