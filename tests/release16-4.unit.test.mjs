import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Release 16.4 lets the protected SVG own the visible card', async () => {
  const css = await read('src/styles/release-16-4.css');
  const layout = await read('src/layouts/ModernLayout.astro');

  assert.match(layout, /release-16-4\.css/);
  assert.match(css, /overflow: visible !important/);
  assert.match(css, /border-radius: 0 !important/);
  assert.match(css, /background: transparent !important/);
  assert.match(css, /filter: none !important/);
  assert.match(css, /forced-color-adjust: none/);
  assert.doesNotMatch(css, /background-color: #(?:fff|ffffff) !important/);
});

test('Release 16.4 publishes a static office vCard without external dependencies', async () => {
  const card = await read('public/donovan-family-dentistry.vcf');
  const layout = await read('src/layouts/ModernLayout.astro');
  const modernContact = await read('src/pages/modern/contact.astro');
  const contactActions = await read('src/components/ContactActionStack.astro');
  const classicContact = await read('src/pages/contact.astro');

  assert.match(card, /BEGIN:VCARD/);
  assert.match(card, /VERSION:3\.0/);
  assert.match(card, /FN:Donovan Family Dentistry/);
  assert.match(card, /TEL;TYPE=WORK,VOICE:\+18435256866/);
  assert.match(card, /ADR;TYPE=WORK:;;91 Sams Point Road;Beaufort;SC;29907;USA/);
  assert.doesNotMatch(card, /https?:\/\//i);
  assert.doesNotMatch(card, /patient|diagnos|insurance id|social security/i);

  assert.match(modernContact, /ContactActionStack/);
  for (const document of [layout, contactActions, classicContact]) {
    assert.match(document, /\/donovan-family-dentistry\.vcf/);
    assert.match(document, /Save office contact/);
  }
});

test('Release 16.4 modernizes the recovery page without adding unverified claims', async () => {
  const page = await read('src/pages/404.astro');
  const release = await read('docs/release-16-4-logo-polish-contact-utilities.md');

  assert.match(page, /import ModernLayout/);
  assert.match(page, /That page is not here/);
  assert.match(page, /href="\/modern\/"/);
  assert.match(page, /href=\{`tel:\$\{site\.phoneHref\}`\}/);
  assert.match(page, /href="\/modern\/forms\/"/);
  assert.match(release, /physical-device screenshot/i);
  assert.match(release, /does not change production DNS/i);
});
