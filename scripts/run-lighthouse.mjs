import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';

const run = (command, args) => spawnSync(command, args, { encoding: 'utf8', stdio: 'pipe' });
const node = process.execPath;
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const fixture = run(node, ['scripts/prepare-lighthouse-fixture.mjs']);
process.stdout.write(fixture.stdout ?? '');
process.stderr.write(fixture.stderr ?? '');
if (fixture.status !== 0) process.exit(fixture.status ?? 1);

const lighthouse = run(npx, ['--yes', '@lhci/cli@0.15.1', 'autorun', '--config=lighthouserc.cjs']);
const output = `${lighthouse.stdout ?? ''}${lighthouse.stderr ?? ''}`;
await mkdir('validation-reports', { recursive: true });
await writeFile('validation-reports/lighthouse-ci.txt', output || 'No Lighthouse CI output.\n');
process.stdout.write(output);
if (lighthouse.error) {
  console.error(`Unable to execute Lighthouse CI: ${lighthouse.error.message}`);
  process.exit(1);
}
if (lighthouse.status !== 0) process.exit(lighthouse.status ?? 1);
console.log('Lighthouse CI passed all configured Classic public-page thresholds.');
