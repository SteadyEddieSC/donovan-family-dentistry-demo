import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptPath = fileURLToPath(import.meta.url);

const REQUIRED_TOOL_IDS = [
  'pages-cms',
  'cloudflare-pages',
  'turnstile',
  'administrative-inquiry',
  'web-analytics',
  'search-console',
  'secure-patient-intake',
  'scheduling-messaging-payments'
];

const REQUIRED_CMS_PATHS = [
  'src/data/site.json',
  'src/data/providers.json',
  'src/data/services.json',
  'src/data/forms.json',
  'public/images',
  '.github/workflows/office-site-check.yml'
];

const REQUIRED_EDITABLE_CMS_PATHS = [
  'src/data/site.json',
  'src/data/providers.json',
  'src/data/services.json',
  'src/data/forms.json'
];

const REQUIRED_GENERATED_FORM_TARGETS = [
  'public/forms/Donovan-Medical-History-3-17.pdf',
  'public/forms/donovan-family-dentistry-privacy-policy.pdf'
];

const ALLOWED_TOOL_STATUSES = new Set([
  'configured-pending-acceptance',
  'preview-deployed',
  'code-ready-unconfigured',
  'code-ready-disabled',
  'optional-disabled',
  'post-cutover',
  'not-selected'
]);

function duplicateValues(values) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

export function evaluateRelease16Readiness({
  toolReadiness,
  pagesConfig,
  quickstart,
  officeWorkflow,
  assetManifest = [],
  materializer = '',
  existingPaths = new Set()
}) {
  const failures = [];
  const warnings = [];

  if (toolReadiness?.schemaVersion !== 1) failures.push('tool-readiness schemaVersion must be 1.');
  if (toolReadiness?.release !== 16) failures.push('tool-readiness release must be 16.');
  if (toolReadiness?.actualDomainCutoverRelease !== 17) {
    failures.push('Release 16 must keep the actual production-domain cutover assigned to Release 17.');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(toolReadiness?.reviewedOn ?? '')) {
    failures.push('tool-readiness reviewedOn must use YYYY-MM-DD.');
  }

  const cms = toolReadiness?.cms ?? {};
  if (cms.editorUrl !== 'https://app.pagescms.org/') failures.push('Pages CMS editorUrl must use the official hosted app.');
  if (cms.repository !== 'SteadyEddieSC/donovan-family-dentistry-demo') failures.push('Pages CMS repository must match this website repository.');
  if (cms.normalBranch !== 'main') failures.push('Pages CMS normalBranch must remain main.');
  if (cms.repositoryConfiguration !== 'ready') failures.push('Pages CMS repositoryConfiguration must be ready.');
  if (cms.operationalAcceptance !== 'pending-owner-test') {
    failures.push('Pages CMS operationalAcceptance must remain pending-owner-test until durable owner evidence is recorded.');
  }
  if (!Array.isArray(cms.acceptanceSteps) || cms.acceptanceSteps.length < 6) {
    failures.push('Pages CMS acceptanceSteps must preserve the save, verification, deployment, and recovery exercise.');
  }

  const tools = Array.isArray(toolReadiness?.tools) ? toolReadiness.tools : [];
  const toolIds = tools.map((tool) => tool?.id).filter(Boolean);
  const duplicateIds = duplicateValues(toolIds);
  if (duplicateIds.length) failures.push(`tool-readiness contains duplicate tool IDs: ${duplicateIds.join(', ')}.`);

  for (const id of REQUIRED_TOOL_IDS) {
    if (!toolIds.includes(id)) failures.push(`tool-readiness is missing ${id}.`);
  }

  for (const tool of tools) {
    if (!tool?.id || !tool?.label || !tool?.provider || !tool?.status || !tool?.cost) {
      failures.push('Every tool must include id, label, provider, status, and cost.');
      continue;
    }
    if (!ALLOWED_TOOL_STATUSES.has(tool.status)) failures.push(`Tool ${tool.id} has an unsupported status: ${tool.status}.`);
    for (const key of ['phiAllowed', 'codeReady', 'accountReady', 'ownerDecisionNeeded']) {
      if (typeof tool[key] !== 'boolean') failures.push(`Tool ${tool.id} must define ${key} as a boolean.`);
    }
    if (!Array.isArray(tool.blockers) || tool.blockers.length === 0) failures.push(`Tool ${tool.id} must retain at least one blocker.`);
  }

  const pagesCms = tools.find((tool) => tool.id === 'pages-cms');
  if (pagesCms?.status !== 'configured-pending-acceptance' || pagesCms?.accountReady !== false) {
    failures.push('Pages CMS must remain configured-pending-acceptance with accountReady false until the owner test is recorded.');
  }

  const inquiry = tools.find((tool) => tool.id === 'administrative-inquiry');
  if (inquiry?.phiAllowed !== false || inquiry?.status !== 'code-ready-disabled') {
    failures.push('The administrative inquiry tool must remain non-PHI and code-ready-disabled.');
  }

  for (const id of ['secure-patient-intake', 'scheduling-messaging-payments']) {
    const tool = tools.find((item) => item.id === id);
    if (tool?.phiAllowed !== true || tool?.status !== 'not-selected') {
      failures.push(`${id} must remain a PHI-capable, not-selected future vendor category.`);
    }
  }

  if (!pagesConfig.includes('settings:') || !pagesConfig.includes('identity: user')) {
    failures.push('.pages.yml must preserve user-attributed commit settings.');
  }
  if (!pagesConfig.includes('actions:') || !pagesConfig.includes('workflow: office-site-check.yml')) {
    failures.push('.pages.yml must preserve the Build and verify website action.');
  }
  for (const cmsPath of REQUIRED_EDITABLE_CMS_PATHS) {
    if (!pagesConfig.includes(`path: ${cmsPath}`)) failures.push(`.pages.yml is missing editable path ${cmsPath}.`);
  }
  if (pagesConfig.includes('path: src/data/practice-content.json') || pagesConfig.includes('path: src/data/modern-team.json')) {
    failures.push('.pages.yml must keep Modern-only page wording and Modern-only staff profiles out of the office-facing editor.');
  }
  if (!pagesConfig.includes('input: public/images') || !pagesConfig.includes('input: public/forms')) {
    failures.push('.pages.yml must preserve the approved image and patient-PDF media libraries.');
  }

  for (const cmsPath of REQUIRED_CMS_PATHS) {
    if (!existingPaths.has(cmsPath)) failures.push(`Required CMS path does not exist: ${cmsPath}.`);
  }

  const generatedTargets = new Set(
    Array.isArray(assetManifest) ? assetManifest.map((asset) => asset?.target).filter(Boolean) : []
  );
  for (const target of REQUIRED_GENERATED_FORM_TARGETS) {
    if (!generatedTargets.has(target)) failures.push(`Asset manifest is missing patient PDF target ${target}.`);
  }
  if (!materializer.includes('if (existsSync(target)) continue;')) {
    failures.push('Asset materialization must preserve a PDF committed through Pages CMS instead of overwriting it.');
  }

  for (const requiredText of [
    'https://app.pagescms.org/',
    'main',
    'Acceptance exercise',
    'Build and verify website',
    'patient information'
  ]) {
    if (!quickstart.includes(requiredText)) failures.push(`CMS quick start is missing required guidance: ${requiredText}.`);
  }

  for (const requiredWorkflowText of [
    'workflow_dispatch:',
    'npm run test:unit',
    'npm run build',
    'npm run test:e2e',
    'npm run test:compat'
  ]) {
    if (!officeWorkflow.includes(requiredWorkflowText)) failures.push(`Office website workflow is missing ${requiredWorkflowText}.`);
  }

  const readyTools = tools.filter((tool) => tool.codeReady).length;
  const accountReadyTools = tools.filter((tool) => tool.accountReady).length;
  warnings.push(`${readyTools} of ${tools.length} tool categories have repository-side code ready.`);
  warnings.push(`${accountReadyTools} of ${tools.length} tool categories have an account or deployed service ready.`);
  warnings.push('Pages CMS operational acceptance and every Release 15 launch-evidence item remain required before cutover.');

  return {
    ok: failures.length === 0,
    failures,
    warnings,
    toolCount: tools.length,
    readyTools,
    accountReadyTools
  };
}

async function readText(relativePath) {
  return readFile(path.join(repositoryRoot, relativePath), 'utf8');
}

async function readJson(relativePath) {
  return JSON.parse(await readText(relativePath));
}

async function pathExists(relativePath) {
  try {
    await stat(path.join(repositoryRoot, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const [toolReadiness, pagesConfig, quickstart, officeWorkflow, assetManifest, materializer] = await Promise.all([
    readJson('src/data/tool-readiness.json'),
    readText('.pages.yml'),
    readText('docs/office-cms-quickstart.md'),
    readText('.github/workflows/office-site-check.yml'),
    readJson('.asset-source/manifest.json'),
    readText('scripts/materialize-assets.mjs')
  ]);

  const pathEntries = await Promise.all(
    REQUIRED_CMS_PATHS.map(async (relativePath) => [relativePath, await pathExists(relativePath)])
  );
  const existingPaths = new Set(pathEntries.filter(([, exists]) => exists).map(([relativePath]) => relativePath));

  const result = evaluateRelease16Readiness({
    toolReadiness,
    pagesConfig,
    quickstart,
    officeWorkflow,
    assetManifest,
    materializer,
    existingPaths
  });

  if (!result.ok) {
    console.error('Release 16 CMS and tool-readiness gate failed:');
    for (const failure of result.failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log(
    `Release 16 CMS and tool-readiness gate passed for ${result.toolCount} tool categories; ${result.readyTools} have code ready and ${result.accountReadyTools} have an account or deployed service ready.`
  );
  for (const warning of result.warnings) console.log(`- ${warning}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  await main();
}
