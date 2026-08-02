import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Release 16.6 keeps the contact-card download first and visually featured', async () => {
  const [stack, css, layout] = await Promise.all([
    read('src/components/ContactActionStack.astro'),
    read('src/styles/release-16-6.css'),
    read('src/layouts/ModernLayout.astro')
  ]);

  const saveIndex = stack.indexOf('Downloadable Contact Card');
  const callIndex = stack.indexOf('Call the office');
  const directionsIndex = stack.indexOf('Open directions');
  const formsIndex = stack.indexOf('Patient forms');

  assert.ok(saveIndex >= 0 && saveIndex < callIndex && callIndex < directionsIndex && directionsIndex < formsIndex);
  assert.match(stack, /modern-contact-tile modern-contact-tile--featured/);
  assert.match(stack, /href="\/donovan-family-dentistry\.vcf" download/);
  assert.match(css, /\.modern-contact-tile--featured/);
  assert.match(css, /color: #062f35/);
  assert.match(css, /@media \(forced-colors: active\)/);
  assert.match(layout, /release-16-6\.css/);
  assert.match(layout, /release-16-7\.css/);
});

test('Release 16.6 uses restrained inline icons without replacing visible labels', async () => {
  const [icon, stack] = await Promise.all([
    read('src/components/ActionIcon.astro'),
    read('src/components/ContactActionStack.astro')
  ]);

  assert.match(icon, /aria-hidden="true"/);
  assert.match(icon, /focusable="false"/);
  assert.match(icon, /name: 'contact' \| 'phone' \| 'directions' \| 'forms'/);
  assert.doesNotMatch(icon, /https?:\/\//i);
  assert.doesNotMatch(icon, /<img/i);

  for (const label of ['Downloadable Contact Card', 'Call the office', 'Open directions', 'Patient forms']) {
    assert.match(stack, new RegExp(label));
  }
});

test('Release 16.6 keeps the same contact-card utility on the New Patients page', async () => {
  const page = await read('src/pages/modern/new-patients/index.astro');

  assert.match(page, /modern-save-contact-card/);
  assert.match(page, /\/donovan-family-dentistry\.vcf/);
  assert.match(page, /Downloadable Contact Card/);
  assert.match(page, /open the file to import it/);
  assert.match(page, /<ActionIcon name="contact" \/>/);
});
