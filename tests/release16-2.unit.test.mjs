import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Release 16.2 modern layout uses the self-protected oval sign vector', async () => {
  const layout = await read('src/layouts/ModernLayout.astro');
  const css = await read('src/styles/release-16-2.css');
  const logo = await read('public/images/donovan-sign-logo.svg');

  assert.match(layout, /const modernLogo = '\/images\/donovan-sign-logo\.svg'/);
  assert.match(layout, /release-16-2\.css/);
  assert.equal((layout.match(/src=\{modernLogo\}/g) || []).length, 2);

  assert.match(logo, /viewBox="0 0 800 400"/);
  assert.match(logo, /<ellipse[^>]*fill="#fffdf8"[^>]*stroke="#006b93"/);
  assert.match(logo, /fill="#12233f"/);
  assert.match(logo, /fill="#00749d"/);
  assert.match(logo, /fill="#6f9f2b"/);
  assert.doesNotMatch(logo, /<image/i);
  assert.doesNotMatch(logo, /checker/i);
  assert.doesNotMatch(logo, /data:image/i);

  assert.match(css, /background: transparent !important/);
  assert.match(css, /filter: drop-shadow/);
  assert.match(css, /border-radius: 0 !important/);
});

test('Office content backup is manual, read-only, fixed-scope, and integrity checked', async () => {
  const workflow = await read('.github/workflows/office-content-backup.yml');

  assert.match(workflow, /name: Create office content backup/);
  assert.match(workflow, /workflow_dispatch/);
  assert.match(workflow, /contents: read/);
  assert.doesNotMatch(workflow, /contents: write/);
  assert.match(workflow, /ref: main/);
  assert.match(workflow, /src\/data\/site\.json/);
  assert.match(workflow, /public\/images/);
  assert.match(workflow, /public\/forms/);
  assert.match(workflow, /sha256sum/);
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.match(workflow, /retention-days: 30/);
  assert.doesNotMatch(workflow, /git push/);
  assert.match(workflow, /not a patient-record backup/i);
});

test('Release 16.2 documentation explains backup purpose and restoration boundary', async () => {
  const readme = await read('README.md');
  const backupGuide = await read('docs/office-content-backup.md');
  const release = await read('docs/release-16-2-logo-backup.md');
  const roadmap = await read('docs/roadmap.md');

  for (const document of [readme, backupGuide, release, roadmap]) {
    assert.match(document, /Create office content backup/);
  }

  assert.match(backupGuide, /does not deploy/i);
  assert.match(backupGuide, /does not roll back/i);
  assert.match(backupGuide, /30 days/);
  assert.match(backupGuide, /completed forms/i);
  assert.match(release, /self-protected oval/i);
  assert.match(roadmap, /Release 16\.2/);
});
