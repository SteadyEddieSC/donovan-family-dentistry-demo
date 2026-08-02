import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const readJson = async (path) => JSON.parse(await read(path));

test('Release 16.9 keeps calm communication together and removes visible project language', async () => {
  const content = await readJson('src/data/practice-content.json');
  const serialized = JSON.stringify(content);

  assert.match(content.about.valuesTitle, /calm\u00a0communication/);
  assert.match(content.about.storyParagraphs[1], /look closely, explain what matters in plain language/);
  assert.match(content.about.storyParagraphs[1], /organize recommendations into steps patients can understand and plan for/);

  for (const internalPhrase of [
    'without repeating the full dentist biography found on the Team page',
    'Provider details are maintained in the office editor',
    'Role-based profiles keep the page useful now',
    'Individual staff names and photographs can be added whenever the office approves them',
    'Every service remains subject to office confirmation'
  ]) {
    assert.doesNotMatch(serialized, new RegExp(internalPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('Release 16.9 loads balanced heading styles after the prior release layers', async () => {
  const [layout, styles] = await Promise.all([
    read('src/layouts/ModernLayout.astro'),
    read('src/styles/release-16-9.css')
  ]);

  assert.match(layout, /release-16-8\.css[\s\S]*release-16-9\.css/);
  assert.match(styles, /text-wrap: balance/);
  assert.match(styles, /hyphens: none/);
  assert.match(styles, /max-width: 430px/);
});

test('Release 16.9 documents safe announcement publication and removal', async () => {
  const [readme, quickstart, ownerGuide, announcementGuide] = await Promise.all([
    read('README.md'),
    read('docs/office-cms-quickstart.md'),
    read('docs/owner-editing-guide.md'),
    read('docs/office-announcement-guide.md')
  ]);

  for (const document of [readme, quickstart, ownerGuide, announcementGuide]) {
    assert.match(document, /Show announcement/);
    assert.match(document, /phone and desktop/i);
    assert.match(document, /protected health information/i);
  }

  assert.match(readme, /docs\/office-announcement-guide\.md/);
  assert.match(quickstart, /modern page, a classic page, and an interior page/i);
  assert.match(ownerGuide, /weather closure, holiday hours, an office-wide phone outage/i);
  assert.match(announcementGuide, /Remove an announcement/);
  assert.match(announcementGuide, /Restore latest office save/);
});
