import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptPath = fileURLToPath(import.meta.url);

const REQUIRED_EVIDENCE_IDS = [
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

const REQUIRED_CONTENT_BLOCKERS = [
  'provider-roster',
  'services',
  'insurance-payment',
  'urgent-care-wording',
  'production-integrations'
];

const CLEAR_STATUSES = new Set(['verified', 'approved-deferred']);
const ALLOWED_PHASES = new Set(['readiness', 'production']);
const ALLOWED_DESIGNS = new Set(['modern', 'classic']);
const ALLOWED_INQUIRY_MODES = new Set(['preview-only', 'live']);

function duplicateValues(values) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function normalizeDomain(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase().replace(/\.$/, '');
  if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(normalized)) return null;
  return normalized;
}

export function evaluateRelease15Readiness({ site, contentStatus, launchReadiness, environment = {} }) {
  const failures = [];
  const warnings = [];
  const phase = environment.LAUNCH_PHASE ?? launchReadiness.phase;
  const previewOverride = environment.LAUNCH_PREVIEW_MODE;

  if (!ALLOWED_PHASES.has(phase)) failures.push('launch-readiness phase must be readiness or production.');
  if (!ALLOWED_DESIGNS.has(launchReadiness.selectedDesign)) failures.push('selectedDesign must be modern or classic.');
  if (launchReadiness.selectedDesign !== 'modern') failures.push('Release 15 records the modern concept as the selected launch candidate.');
  if (!ALLOWED_INQUIRY_MODES.has(launchReadiness.inquiryLaunchMode)) failures.push('inquiryLaunchMode must be preview-only or live.');

  const targetDomain = normalizeDomain(launchReadiness.targetDomain);
  if (!targetDomain) failures.push('targetDomain must be a valid public DNS name without a protocol or path.');

  let canonicalUrl;
  try {
    canonicalUrl = new URL(launchReadiness.canonicalOrigin);
  } catch {
    failures.push('canonicalOrigin must be a valid absolute HTTPS URL.');
  }
  if (canonicalUrl) {
    if (canonicalUrl.protocol !== 'https:') failures.push('canonicalOrigin must use HTTPS.');
    if (canonicalUrl.pathname !== '/' || canonicalUrl.search || canonicalUrl.hash) failures.push('canonicalOrigin must contain only the production origin.');
    if (targetDomain && canonicalUrl.hostname !== targetDomain) failures.push('canonicalOrigin hostname must match targetDomain.');
  }

  if (!Array.isArray(launchReadiness.requiredEvidence)) failures.push('requiredEvidence must be an array.');
  const evidence = Array.isArray(launchReadiness.requiredEvidence) ? launchReadiness.requiredEvidence : [];
  const evidenceIds = evidence.map((item) => item?.id).filter(Boolean);
  const duplicatedEvidenceIds = duplicateValues(evidenceIds);
  if (duplicatedEvidenceIds.length) failures.push(`requiredEvidence contains duplicate IDs: ${duplicatedEvidenceIds.join(', ')}.`);

  for (const id of REQUIRED_EVIDENCE_IDS) {
    if (!evidenceIds.includes(id)) failures.push(`requiredEvidence is missing ${id}.`);
  }
  for (const item of evidence) {
    if (!item?.id || !item?.label || !item?.status || !item?.clearanceNeeded) {
      failures.push('Every requiredEvidence item must include id, label, status, and clearanceNeeded.');
      continue;
    }
    if (CLEAR_STATUSES.has(item.status) && !item.evidenceRef) {
      failures.push(`Cleared evidence ${item.id} must include a non-empty evidenceRef.`);
    }
  }

  if (!Array.isArray(launchReadiness.currentSiteSources) || launchReadiness.currentSiteSources.length === 0) {
    failures.push('currentSiteSources must preserve the current-production reconciliation sources.');
  } else {
    const sourceIds = launchReadiness.currentSiteSources.map((item) => item?.id).filter(Boolean);
    const duplicateSourceIds = duplicateValues(sourceIds);
    if (duplicateSourceIds.length) failures.push(`currentSiteSources contains duplicate IDs: ${duplicateSourceIds.join(', ')}.`);
    for (const source of launchReadiness.currentSiteSources) {
      try {
        const url = new URL(source.url);
        if (url.protocol !== 'https:' || url.hostname !== targetDomain) failures.push(`Current-site source ${source.id} must use HTTPS on the target domain.`);
      } catch {
        failures.push(`Current-site source ${source?.id ?? 'unknown'} has an invalid URL.`);
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(source.reviewedOn ?? '')) failures.push(`Current-site source ${source?.id ?? 'unknown'} must include reviewedOn as YYYY-MM-DD.`);
      if (!source.purpose) failures.push(`Current-site source ${source?.id ?? 'unknown'} must explain its purpose.`);
    }
  }

  const blockerIds = Array.isArray(contentStatus.launchBlockers)
    ? contentStatus.launchBlockers.map((item) => item.id)
    : [];
  for (const id of REQUIRED_CONTENT_BLOCKERS) {
    if (!blockerIds.includes(id)) failures.push(`content-status launchBlockers is missing ${id}.`);
  }

  if (previewOverride !== undefined && !['true', 'false'].includes(previewOverride)) {
    failures.push('LAUNCH_PREVIEW_MODE must be true or false when supplied.');
  }
  const previewMode = previewOverride === undefined ? site.previewMode : previewOverride === 'true';

  if (phase === 'readiness') {
    if (previewMode !== true) failures.push('Readiness builds must keep previewMode enabled.');
    if (launchReadiness.productionCutoverApproved !== false) failures.push('Readiness builds cannot mark productionCutoverApproved true.');
    if (launchReadiness.indexingApproved !== false) failures.push('Readiness builds cannot mark indexingApproved true.');
    if (launchReadiness.analyticsApproved !== false) failures.push('Readiness builds cannot mark analyticsApproved true.');
    if (launchReadiness.inquiryLaunchMode !== 'preview-only') failures.push('Readiness builds must keep the inquiry workflow preview-only.');

    const cleared = evidence.filter((item) => CLEAR_STATUSES.has(item.status));
    warnings.push(`${evidence.length - cleared.length} of ${evidence.length} launch-evidence items remain open.`);
  }

  if (phase === 'production') {
    const unresolved = evidence.filter((item) => !CLEAR_STATUSES.has(item.status));
    if (unresolved.length) failures.push(`Production launch is blocked by ${unresolved.length} unresolved launch-evidence item(s): ${unresolved.map((item) => item.id).join(', ')}.`);
    if (previewMode !== false) failures.push('Production launch requires previewMode to be disabled.');
    if (launchReadiness.productionCutoverApproved !== true) failures.push('Production launch requires productionCutoverApproved true.');
    if (launchReadiness.indexingApproved !== true) failures.push('Production launch requires indexingApproved true.');
    if (!launchReadiness.changeWindow) failures.push('Production launch requires an approved changeWindow.');
    if (!launchReadiness.rollbackOwner) failures.push('Production launch requires a named rollbackOwner.');

    const productionIntegrations = evidence.find((item) => item.id === 'production-integrations');
    if (launchReadiness.inquiryLaunchMode === 'live' && productionIntegrations?.status !== 'verified') {
      failures.push('A live inquiry launch requires verified production-integrations evidence.');
    }
  }

  return {
    ok: failures.length === 0,
    phase,
    targetDomain,
    failures,
    warnings,
    evidenceCount: evidence.length,
    unresolvedCount: evidence.filter((item) => !CLEAR_STATUSES.has(item.status)).length
  };
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(repositoryRoot, relativePath), 'utf8'));
}

async function main() {
  const [site, contentStatus, launchReadiness] = await Promise.all([
    readJson('src/data/site.json'),
    readJson('src/data/content-status.json'),
    readJson('src/data/launch-readiness.json')
  ]);

  const result = evaluateRelease15Readiness({
    site,
    contentStatus,
    launchReadiness,
    environment: process.env
  });

  if (!result.ok) {
    console.error('Release 15 launch-readiness gate failed:');
    for (const failure of result.failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(
    `Release 15 launch-readiness gate passed in ${result.phase} phase for ${result.targetDomain}; ${result.unresolvedCount} of ${result.evidenceCount} launch-evidence items remain open.`
  );
  for (const warning of result.warnings) console.log(`- ${warning}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  await main();
}
