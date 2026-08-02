import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Release 16.1 restores the clean CMS acceptance copy', async () => {
  const site = JSON.parse(await read('src/data/site.json'));
  assert.equal(
    site.introduction,
    'We utilize up-to-date techniques and dental procedures in a comfortable and caring environment.'
  );
  assert.equal(site.introduction.includes('Test test test'), false);
  assert.deepEqual(site.announcement, { enabled: false, text: '' });
});

test('Release 16.1 logo uses the sign-aligned blue, navy, and green treatment', async () => {
  const logo = await read('public/images/donovan-logo.svg');
  assert.match(logo, /stroke="#006b93"/);
  assert.match(logo, /fill="#12233f">DONOVAN/);
  assert.match(logo, /fill="#00749d"/);
  assert.match(logo, /fill="#72a928"/);
  assert.match(logo, /font-weight="700"[^>]*>FAMILY DENTISTRY/);
});

test('Release 16.1 removes the duplicate homepage dock and protects interior pages', async () => {
  const layout = await read('src/layouts/ModernLayout.astro');
  const css = await read('src/styles/release-16-1.css');

  assert.match(layout, /path !== '\/modern\/' && !path\.startsWith\('\/modern\/contact\/'\)/);
  assert.match(layout, /modern-body--with-dock/);
  assert.match(layout, /release-16-1\.css/);
  assert.match(css, /padding-bottom: calc\(5\.75rem \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(css, /overflow-wrap: normal/);
  assert.match(css, /word-break: normal/);
  assert.match(css, /hyphens: none/);
});

test('Restore latest office save is fail-closed and preserves history', async () => {
  const workflow = await read('.github/workflows/office-rollback.yml');

  assert.match(workflow, /if: github\.ref_name == 'main'/);
  assert.match(workflow, /latest_subject.*office\\ update:/s);
  assert.match(workflow, /src\/data\/site\.json/);
  assert.match(workflow, /public\/images\/\*/);
  assert.match(workflow, /git revert --no-edit/);
  assert.match(workflow, /git push origin HEAD:main/);
  assert.doesNotMatch(workflow, /git reset --hard/);
  assert.doesNotMatch(workflow, /--force/);
});

test('Owner documentation distinguishes Save, verification, deployment, and recovery', async () => {
  const readme = await read('README.md');
  const quickstart = await read('docs/office-cms-quickstart.md');
  const guide = await read('docs/owner-editing-guide.md');

  for (const document of [readme, quickstart, guide]) {
    assert.match(document, /Save/);
    assert.match(document, /Build and verify website/);
    assert.match(document, /Restore latest office save/);
    assert.match(document, /Cloudflare/);
  }

  assert.match(readme, /does not save content/);
  assert.match(guide, /There is no ordinary \*\*Revert\*\* button/);
  assert.match(quickstart, /More → Actions/);
});
