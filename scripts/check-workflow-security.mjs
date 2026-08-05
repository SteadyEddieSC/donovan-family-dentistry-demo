import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const failures = [];
const workflowDirectory = '.github/workflows';
const workflowFiles = (await readdir(workflowDirectory))
  .filter((name) => /\.ya?ml$/i.test(name))
  .map((name) => path.join(workflowDirectory, name));
const immutableAction = /^[^\s]+@[0-9a-f]{40}(?:\s+#.*)?$/i;

for (const file of workflowFiles) {
  const source = await readFile(file, 'utf8');
  const lines = source.split(/\r?\n/);
  if (!/^permissions:\s*$/m.test(source) && !/^permissions:\s*\{\s*\}\s*$/m.test(source)) failures.push(`${file}: workflow must declare top-level least-privilege permissions.`);
  if (/permissions:\s*(?:write-all|read-all)/i.test(source)) failures.push(`${file}: broad write-all/read-all permissions are prohibited.`);
  if (/pull_request_target\s*:/i.test(source)) failures.push(`${file}: pull_request_target is prohibited.`);
  if (/\bsecrets:\s*inherit\b/i.test(source)) failures.push(`${file}: blanket secrets inheritance is prohibited.`);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const uses = line.match(/^\s*-?\s*uses:\s*([^\s]+(?:\s+#.*)?)$/);
    if (uses && !uses[1].startsWith('./') && !immutableAction.test(uses[1])) failures.push(`${file}:${index + 1}: third-party action must use an immutable 40-character commit SHA.`);
    if (/\brun:\s*.*\$\{\{\s*github\.event\./i.test(line)) failures.push(`${file}:${index + 1}: untrusted event data must not be interpolated directly into a shell command.`);
  }

  const checkoutBlocks = [...source.matchAll(/uses:\s*actions\/checkout@[0-9a-f]{40}[^\n]*\n([\s\S]*?)(?=\n\s*-\s+(?:name:|uses:|run:)|\n\s{0,4}[a-zA-Z_-]+:|$)/g)];
  for (const block of checkoutBlocks) {
    if (!/persist-credentials:\s*false/i.test(block[1])) failures.push(`${file}: every checkout step must set persist-credentials: false.`);
  }
}

if (!workflowFiles.length) failures.push('No GitHub Actions workflows were found.');
if (failures.length) {
  console.error('Workflow security policy failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Workflow security policy passed for ${workflowFiles.length} workflow file(s): immutable action pins, explicit permissions, safe checkout credentials, and no pull_request_target use.`);
