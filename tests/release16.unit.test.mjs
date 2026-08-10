import assert from 'node:assert/strict';
import test from 'node:test';

import { evaluateRelease16Readiness } from '../scripts/check-release16-readiness.mjs';

const requiredPaths = new Set([
  'src/data/site.json',
  'src/data/providers.json',
  'src/data/services.json',
  'src/data/forms.json',
  'public/images',
  '.github/workflows/office-site-check.yml'
]);

const assetManifest = [
  { target: 'public/forms/Donovan-Medical-History-3-17.pdf' },
  { target: 'public/forms/donovan-family-dentistry-privacy-policy.pdf' }
];

const materializer = `
for (const asset of manifest) {
  const target = join(root, asset.target);
  if (existsSync(target)) continue;
}
`;

const pagesConfig = `
media:
  - input: public/images
  - input: public/forms
settings:
  commit:
    identity: user
actions:
  - workflow: office-site-check.yml
content:
  - path: src/data/site.json
  - path: src/data/providers.json
  - path: src/data/services.json
  - path: src/data/forms.json
`;

const quickstart = `
https://app.pagescms.org/
Use the main branch.
## Acceptance exercise
Run Build and verify website.
Do not enter patient information.
`;

const officeWorkflow = `
on:
  workflow_dispatch:
steps:
  - run: npm run test:unit
  - run: npm run build
  - run: npm run test:e2e
  - run: npm run test:compat
`;

function tool(id, status, overrides = {}) {
  return {
    id,
    label: id,
    provider: id,
    status,
    cost: '$0',
    phiAllowed: false,
    codeReady: true,
    accountReady: false,
    ownerDecisionNeeded: true,
    blockers: ['Owner action required.'],
    ...overrides
  };
}

function fixture() {
  return {
    schemaVersion: 1,
    release: 16,
    reviewedOn: '2026-08-01',
    actualDomainCutoverRelease: 17,
    cms: {
      editorUrl: 'https://app.pagescms.org/',
      repository: 'SteadyEddieSC/donovan-family-dentistry-demo',
      normalBranch: 'main',
      repositoryConfiguration: 'ready',
      operationalAcceptance: 'pending-owner-test',
      acceptanceSteps: ['authorize', 'sign in', 'save', 'verify', 'deploy', 'restore']
    },
    tools: [
      tool('pages-cms', 'configured-pending-acceptance'),
      tool('cloudflare-pages', 'preview-deployed', { accountReady: true }),
      tool('turnstile', 'code-ready-unconfigured'),
      tool('administrative-inquiry', 'code-ready-disabled'),
      tool('web-analytics', 'optional-disabled'),
      tool('search-console', 'post-cutover'),
      tool('secure-patient-intake', 'not-selected', { phiAllowed: true, codeReady: false }),
      tool('scheduling-messaging-payments', 'not-selected', { phiAllowed: true, codeReady: false })
    ]
  };
}

function evaluate(toolReadiness = fixture(), existingPaths = requiredPaths, overrides = {}) {
  return evaluateRelease16Readiness({
    toolReadiness,
    pagesConfig,
    quickstart,
    officeWorkflow,
    assetManifest,
    materializer,
    existingPaths,
    ...overrides
  });
}

test('configured CMS and tool register pass while owner acceptance stays open', () => {
  const result = evaluate();
  assert.equal(result.ok, true, result.failures.join('\n'));
  assert.equal(result.toolCount, 8);
  assert.equal(result.accountReadyTools, 1);
  assert.match(result.warnings.join('\n'), /operational acceptance/i);
});

test('office CMS intentionally excludes Modern-only wording and staff profiles', () => {
  const modernWording = evaluate(fixture(), requiredPaths, {
    pagesConfig: `${pagesConfig}\n  - path: src/data/practice-content.json\n`
  });
  assert.equal(modernWording.ok, false);
  assert.match(modernWording.failures.join('\n'), /Modern-only page wording/i);

  const modernTeam = evaluate(fixture(), requiredPaths, {
    pagesConfig: `${pagesConfig}\n  - path: src/data/modern-team.json\n`
  });
  assert.equal(modernTeam.ok, false);
  assert.match(modernTeam.failures.join('\n'), /Modern-only page wording/i);
});

test('CMS cannot be marked accepted without changing the governed evidence model', () => {
  const data = fixture();
  data.cms.operationalAcceptance = 'accepted';
  data.tools.find((item) => item.id === 'pages-cms').accountReady = true;
  const result = evaluate(data);
  assert.equal(result.ok, false);
  assert.match(result.failures.join('\n'), /pending-owner-test/);
});

test('public administrative inquiry cannot be represented as a PHI channel', () => {
  const data = fixture();
  data.tools.find((item) => item.id === 'administrative-inquiry').phiAllowed = true;
  const result = evaluate(data);
  assert.equal(result.ok, false);
  assert.match(result.failures.join('\n'), /non-PHI/);
});

test('secure intake and dental-platform categories remain unselected until governed vendor work occurs', () => {
  const data = fixture();
  data.tools.find((item) => item.id === 'secure-patient-intake').status = 'code-ready-unconfigured';
  const result = evaluate(data);
  assert.equal(result.ok, false);
  assert.match(result.failures.join('\n'), /not-selected future vendor category/);
});

test('missing CMS-managed files fail the readiness gate', () => {
  const paths = new Set(requiredPaths);
  paths.delete('src/data/providers.json');
  const result = evaluate(fixture(), paths);
  assert.equal(result.ok, false);
  assert.match(result.failures.join('\n'), /providers\.json/);
});

test('patient PDFs remain represented and office uploads cannot be overwritten', () => {
  const missingTarget = evaluate(fixture(), requiredPaths, {
    assetManifest: [{ target: 'public/forms/Donovan-Medical-History-3-17.pdf' }]
  });
  assert.equal(missingTarget.ok, false);
  assert.match(missingTarget.failures.join('\n'), /donovan-family-dentistry-privacy-policy\.pdf/);

  const overwritingMaterializer = evaluate(fixture(), requiredPaths, {
    materializer: 'writeFileSync(target, bytes);'
  });
  assert.equal(overwritingMaterializer.ok, false);
  assert.match(overwritingMaterializer.failures.join('\n'), /overwriting/);
});
