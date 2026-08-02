import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const readJson = async (path) => JSON.parse(await read(path));

test('Release 16.10 keeps editable text normal and applies phrase control in markup', async () => {
  const [content, page, css] = await Promise.all([
    readJson('src/data/practice-content.json'),
    read('src/pages/modern/about.astro'),
    read('src/styles/release-16-10.css')
  ]);

  assert.equal(content.about.valuesTitle, 'Useful information, calm communication, and a clear next step.');
  assert.doesNotMatch(content.about.valuesTitle, /\u00a0/);
  assert.match(page, /const valuesPhrase = 'calm communication'/);
  assert.match(page, /modern-values-title/);
  assert.match(page, /modern-values-title__phrase/);
  assert.match(css, /font-size: clamp\(2rem, 9\.25vw, 2\.45rem\)/);
  assert.match(css, /max-width: 340px/);
});

test('Release 16.10 uses exact logo green for accents and a lighter related tint for large surfaces', async () => {
  const [logo, priorCss, css] = await Promise.all([
    read('public/images/donovan-logo.svg'),
    read('src/styles/release-16-7.css'),
    read('src/styles/release-16-10.css')
  ]);

  assert.match(logo, /fill="#72a928"/i);
  assert.match(priorCss, /--modern-brand-green: #72a928/i);
  assert.match(css, /--modern-brand-green-surface: #8bb84f/i);
  assert.match(css, /--modern-brand-green-surface-hover: #96c25f/i);
  assert.match(css, /\.modern-contact-tile--featured/);
  assert.match(css, /\.modern-save-contact-card/);
  assert.match(css, /forced-colors: active/);
});

test('Release 16.10 loads last and documents the correction boundary', async () => {
  const [layout, release] = await Promise.all([
    read('src/layouts/ModernLayout.astro'),
    read('docs/release-16-10-responsive-heading-green.md')
  ]);

  assert.match(layout, /release-16-9\.css[\s\S]*release-16-10\.css/);
  assert.match(release, /horizontal overflow/i);
  assert.match(release, /perceptual/i);
  assert.match(release, /does not activate Open Dental/i);
});
