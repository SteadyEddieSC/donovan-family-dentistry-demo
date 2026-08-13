import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateRelease15Readiness } from '../scripts/check-release15-readiness.mjs';
import {
  normalizeInventoryDomain,
  selectSafeHeaders,
  summarizeInventory
} from '../scripts/inventory-domain.mjs';

const requiredEvidenceIds = [
  'provider-roster',
  'services',
  'insurance-payment',
  'urgent-care-wording',
  'production-integrations',
  'physical-device-review',
  'human-wcag-review',
  'dns-zone-backup',
  'email-service-preservation',
  'portal-scheduling-preservation',
  'rollback-rehearsal',
  'change-window'
];

function makeFixture() {
  return {
    site: { previewMode: true },
    contentStatus: {
      launchBlockers: []
    },
    launchReadiness: {
      phase: 'readiness',
      selectedDesign: 'classic',
      targetDomain: 'donovanfamilydentistry.com',
      canonicalOrigin: 'https://donovanfamilydentistry.com',
      productionCutoverApproved: false,
      indexingApproved: false,
      inquiryLaunchMode: 'preview-only',
      analyticsApproved: false,
      changeWindow: null,
      rollbackOwner: null,
      requiredEvidence: requiredEvidenceIds.map((id) => ({
        id,
        label: id,
        status: 'pending-owner-approval',
        evidenceRef: null,
        clearanceNeeded: `Clear ${id}`
      })),
      currentSiteSources: [
        {
          id: 'current-home',
          url: 'https://donovanfamilydentistry.com/',
          reviewedOn: '2026-08-01',
          purpose: 'Current public homepage.'
        }
      ]
    }
  };
}

test('readiness phase passes only with preview and production controls disabled', () => {
  const fixture = makeFixture();
  const result = evaluateRelease15Readiness(fixture);
  assert.equal(result.ok, true);
  assert.equal(result.phase, 'readiness');
  assert.equal(result.unresolvedCount, requiredEvidenceIds.length);

  fixture.site.previewMode = false;
  const unsafe = evaluateRelease15Readiness(fixture);
  assert.equal(unsafe.ok, false);
  assert.match(unsafe.failures.join('\n'), /keep previewMode enabled/i);
});

test('production phase fails closed until every evidence item is cleared', () => {
  const fixture = makeFixture();
  fixture.launchReadiness.phase = 'production';
  fixture.site.previewMode = false;
  fixture.launchReadiness.productionCutoverApproved = true;
  fixture.launchReadiness.indexingApproved = true;
  fixture.launchReadiness.changeWindow = '2026-09-01T09:00:00-04:00';
  fixture.launchReadiness.rollbackOwner = 'Named administrator';

  const result = evaluateRelease15Readiness(fixture);
  assert.equal(result.ok, false);
  assert.match(result.failures.join('\n'), /unresolved launch-evidence/i);
});

test('production phase accepts recorded evidence while allowing a preview-only inquiry decision', () => {
  const fixture = makeFixture();
  fixture.launchReadiness.phase = 'production';
  fixture.site.previewMode = false;
  fixture.launchReadiness.productionCutoverApproved = true;
  fixture.launchReadiness.indexingApproved = true;
  fixture.launchReadiness.changeWindow = '2026-09-01T09:00:00-04:00';
  fixture.launchReadiness.rollbackOwner = 'Named administrator';
  fixture.launchReadiness.requiredEvidence = fixture.launchReadiness.requiredEvidence.map((item) => ({
    ...item,
    status: item.id === 'production-integrations' ? 'approved-deferred' : 'verified',
    evidenceRef: `evidence/${item.id}.md`
  }));

  const result = evaluateRelease15Readiness(fixture);
  assert.equal(result.ok, true);
  assert.equal(result.unresolvedCount, 0);
});

test('live inquiry mode requires verified integration evidence', () => {
  const fixture = makeFixture();
  fixture.launchReadiness.phase = 'production';
  fixture.site.previewMode = false;
  fixture.launchReadiness.productionCutoverApproved = true;
  fixture.launchReadiness.indexingApproved = true;
  fixture.launchReadiness.inquiryLaunchMode = 'live';
  fixture.launchReadiness.changeWindow = '2026-09-01T09:00:00-04:00';
  fixture.launchReadiness.rollbackOwner = 'Named administrator';
  fixture.launchReadiness.requiredEvidence = fixture.launchReadiness.requiredEvidence.map((item) => ({
    ...item,
    status: item.id === 'production-integrations' ? 'approved-deferred' : 'verified',
    evidenceRef: `evidence/${item.id}.md`
  }));

  const result = evaluateRelease15Readiness(fixture);
  assert.equal(result.ok, false);
  assert.match(result.failures.join('\n'), /live inquiry launch requires verified/i);
});

test('cleared evidence requires a reference and evidence/source IDs remain unique', () => {
  const fixture = makeFixture();
  fixture.launchReadiness.requiredEvidence[0].status = 'verified';
  fixture.launchReadiness.requiredEvidence.push({ ...fixture.launchReadiness.requiredEvidence[1] });

  const result = evaluateRelease15Readiness(fixture);
  assert.equal(result.ok, false);
  assert.match(result.failures.join('\n'), /non-empty evidenceRef/i);
  assert.match(result.failures.join('\n'), /duplicate IDs: services/i);
});

test('domain normalization accepts a public hostname and rejects paths or ports', () => {
  assert.equal(normalizeInventoryDomain('HTTPS://DonovanFamilyDentistry.com/'), 'donovanfamilydentistry.com');
  assert.throws(() => normalizeInventoryDomain('donovanfamilydentistry.com/path'), /path, port, or credentials/i);
  assert.throws(() => normalizeInventoryDomain('localhost:8788'), /path, port, or credentials/i);
});

test('domain inventory retains only allowlisted response headers', () => {
  const headers = new Headers({
    'content-type': 'text/html',
    'strict-transport-security': 'max-age=31536000',
    'set-cookie': 'private=value',
    'x-powered-by': 'secret-stack'
  });

  assert.deepEqual(selectSafeHeaders(headers), {
    'content-type': 'text/html',
    'strict-transport-security': 'max-age=31536000'
  });
});

test('domain inventory summary counts public infrastructure evidence without message data', () => {
  const summary = summarizeInventory({
    domain: 'donovanfamilydentistry.com',
    dns: {
      'root:A': { ok: true, answers: ['192.0.2.10'] },
      'root:MX': { ok: false, answers: [] },
      'www:CNAME': { ok: true, answers: [] }
    },
    http: [{ ok: true }, { ok: false }],
    tls: [{ ok: true, authorized: true }, { ok: true, authorized: false }],
    notes: ['Authoritative export still required.']
  });

  assert.deepEqual(summary, {
    domain: 'donovanfamilydentistry.com',
    recordQueries: 3,
    recordsWithAnswers: 1,
    reachableHttp: 1,
    validTls: 1,
    warnings: 1
  });
});
