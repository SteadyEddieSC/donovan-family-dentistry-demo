import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Release 16.5 review center is local-only and excludes patient information', async () => {
  const page = await read('src/pages/review/index.astro');

  assert.match(page, /data-review-center="local-only"/);
  assert.match(page, /data-mode="local-only"/);
  assert.match(page, /does not submit, store, email, or upload/i);
  assert.match(page, /Do not enter patient information/i);
  assert.match(page, /protected health information/i);
  assert.doesNotMatch(page, /fetch\s*\(/);
  assert.doesNotMatch(page, /localStorage/);
  assert.doesNotMatch(page, /sessionStorage/);
  assert.doesNotMatch(page, /WebSocket/);
});

test('Release 16.5 report records environment and supports user-controlled exports', async () => {
  const page = await read('src/pages/review/index.astro');

  for (const required of [
    'window.innerWidth',
    'window.devicePixelRatio',
    'navigator.maxTouchPoints',
    'navigator.userAgent',
    "prefers-color-scheme: dark",
    "prefers-reduced-motion: reduce",
    'new Blob',
    'navigator.clipboard.writeText',
    'window.print()'
  ]) {
    assert.match(page, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(page, /physical-device-review/);
  assert.match(page, /donovan-device-review-/);
  assert.match(page, /Complete every check/);
});

test('Release 16.5 keeps the review page permanently noindex and out of patient navigation', async () => {
  const [metadata, layout, sitemap] = await Promise.all([
    read('src/components/SiteMetadata.astro'),
    read('src/layouts/ModernLayout.astro'),
    read('src/pages/sitemap.xml.ts')
  ]);

  assert.match(metadata, /forceNoIndex\?: boolean/);
  assert.match(metadata, /site\.previewMode \|\| forceNoIndex/);
  assert.match(layout, /forceNoIndex=\{forceNoIndex\}/);
  assert.match(layout, /site\.previewMode &&/);
  assert.match(layout, /href="\/review\/"/);
  assert.doesNotMatch(sitemap, /['"]\/review\/['"]/);
});

test('Release 16.5 review support does not clear the physical-device or human review gates', async () => {
  const readiness = JSON.parse(await read('src/data/launch-readiness.json'));
  const physical = readiness.requiredEvidence.find((item) => item.id === 'physical-device-review');
  const human = readiness.requiredEvidence.find((item) => item.id === 'human-wcag-review');
  const clearedStatuses = new Set(['verified', 'approved-deferred']);

  assert.deepEqual(readiness.reviewSupport, {
    path: '/review/',
    status: 'available-local-only',
    storesOrSendsData: false,
    guide: 'docs/physical-device-review-guide.md'
  });
  assert.equal(clearedStatuses.has(physical.status), false);
  assert.ok(['pending-launch-review', 'partial-evidence-recorded'].includes(physical.status));
  if (physical.status === 'pending-launch-review') {
    assert.equal(physical.evidenceRef, null);
  } else {
    assert.equal(physical.evidenceRef, 'docs/evidence/physical-device-review-galaxy-s24-fe-2026-08-02.json');
  }
  assert.equal(human.status, 'pending-launch-review');
  assert.equal(human.evidenceRef, null);
});
