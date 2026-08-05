import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

await mkdir('validation-reports', { recursive: true });
const executable = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(executable, [
  '--yes',
  'html-validate@11.5.6',
  'dist/**/*.html',
  '--formatter',
  'stylish'
], {
  encoding: 'utf8',
  shell: process.platform === 'win32'
});
const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
await writeFile('validation-reports/html-validate.txt', output || 'No HTML validation output.\n');
process.stdout.write(output);
if (result.error) {
  console.error(`Unable to execute html-validate: ${result.error.message}`);
  process.exit(1);
}
if (result.status !== 0) process.exit(result.status ?? 1);
console.log('HTML validation passed for generated output.');
