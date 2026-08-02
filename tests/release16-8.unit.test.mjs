import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const readJson = async (path) => JSON.parse(await read(path));

test('Release 16.8 wires one CMS-managed announcement across both concepts', async () => {
  const [site, banner, baseLayout, modernLayout, classicHome, styles] = await Promise.all([
    readJson('src/data/site.json'),
    read('src/components/AnnouncementBanner.astro'),
    read('src/layouts/BaseLayout.astro'),
    read('src/layouts/ModernLayout.astro'),
    read('src/pages/index.astro'),
    read('src/styles/release-16-8.css')
  ]);

  assert.equal(site.announcement.enabled, false);
  assert.match(banner, /announcement\?\.enabled === true/);
  assert.match(banner, /announcement\?\.text\?\.trim/);
  assert.match(banner, /aria-label="Office announcement"/);
  assert.match(baseLayout, /<AnnouncementBanner \/>/);
  assert.match(modernLayout, /<AnnouncementBanner \/>/);
  assert.match(baseLayout, /release-16-8\.css/);
  assert.match(modernLayout, /release-16-8\.css/);
  assert.doesNotMatch(classicHome, /site\.announcement\.enabled/);
  assert.match(styles, /overflow-wrap: anywhere/);
  assert.match(styles, /forced-colors: active/);
});

test('Release 16.8 records Open Dental without activating an unverified patient link', async () => {
  const [tools, page, layout, sitemap] = await Promise.all([
    readJson('src/data/tool-readiness.json'),
    read('src/pages/review/open-dental/index.astro'),
    read('src/layouts/ModernLayout.astro'),
    read('src/pages/sitemap.xml.ts')
  ]);

  const intake = tools.tools.find((tool) => tool.id === 'secure-patient-intake');
  const patientServices = tools.tools.find((tool) => tool.id === 'scheduling-messaging-payments');
  assert.match(intake.provider, /Open Dental Web Forms/);
  assert.equal(intake.status, 'not-selected');
  assert.equal(intake.codeReady, false);
  assert.equal(intake.accountReady, false);
  assert.match(patientServices.provider, /Open Dental eServices and Patient Portal/);
  assert.equal(patientServices.status, 'not-selected');
  assert.match(page, /forceNoIndex=\{true\}/);
  assert.match(page, /No patient-system link is active yet/);
  assert.match(page, /Use the Open Dental API.*direct database writes/);
  assert.doesNotMatch(page, /<iframe|<form|<script/i);
  assert.match(layout, /\/review\/open-dental\//);
  assert.doesNotMatch(sitemap, /\/review\/open-dental\//);
});

test('Release 16.8 preserves the Android review as partial—not complete—launch evidence', async () => {
  const [readiness, evidence] = await Promise.all([
    readJson('src/data/launch-readiness.json'),
    readJson('docs/evidence/physical-device-review-galaxy-s24-fe-2026-08-02.json')
  ]);

  const deviceReview = readiness.requiredEvidence.find((item) => item.id === 'physical-device-review');
  assert.equal(deviceReview.status, 'partial-evidence-recorded');
  assert.equal(deviceReview.evidenceRef, 'docs/evidence/physical-device-review-galaxy-s24-fe-2026-08-02.json');
  assert.match(deviceReview.clearanceNeeded, /remaining required iPhone, iPad, macOS, and Windows/);
  assert.equal(evidence.reportType, 'physical-device-review');
  assert.equal(evidence.device, 'Galaxy S24 FE, Android 16');
  assert.equal(evidence.result, 'pass-with-notes');
  assert.equal(evidence.concept, 'both');
  assert.deepEqual(evidence.checks, [
    'logo',
    'navigation',
    'readability',
    'actions',
    'forms-pdfs',
    'zoom-reflow',
    'dark-mode',
    'focus-access'
  ]);
  assert.match(evidence.collectionBoundary, /did not submit, store, email, or upload/);
});
