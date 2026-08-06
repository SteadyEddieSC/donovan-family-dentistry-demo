import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const runAudit = (args) => {
  const result = spawnSync('npm', ['audit', '--json', ...args], { encoding: 'utf8', shell: process.platform === 'win32' });
  let report;
  try {
    report = JSON.parse(result.stdout || '{}');
  } catch {
    throw new Error(`npm audit did not return valid JSON: ${result.stdout || result.stderr}`);
  }
  return { result, report };
};
const vulnerabilityEntries = (report) => Object.entries(report.vulnerabilities ?? {});
const severityRank = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };
const exceptions = JSON.parse(await readFile('config/security-exceptions.json', 'utf8')).exceptions ?? [];
const today = new Date().toISOString().slice(0, 10);
const failures = [];

for (const exception of exceptions) {
  for (const field of ['package', 'advisory', 'impact', 'reason', 'expires']) {
    if (!exception[field]) failures.push(`Security exception is missing required field ${field}.`);
  }
  if (exception.expires && exception.expires < today) failures.push(`Security exception for ${exception.package} expired on ${exception.expires}.`);
}

const production = runAudit(['--omit=dev']);
const full = runAudit([]);
await mkdir('validation-reports', { recursive: true });
await writeFile('validation-reports/npm-audit-production.json', `${JSON.stringify(production.report, null, 2)}\n`);
await writeFile('validation-reports/npm-audit-full.json', `${JSON.stringify(full.report, null, 2)}\n`);

for (const [name, finding] of vulnerabilityEntries(production.report)) {
  if ((severityRank[finding.severity] ?? 0) < severityRank.high) continue;
  const advisoryIds = (finding.via ?? [])
    .filter((item) => typeof item === 'object')
    .map((item) => String(item.source ?? item.url ?? item.title));
  const accepted = exceptions.some((exception) => exception.package === name && advisoryIds.includes(String(exception.advisory)) && exception.expires >= today);
  if (!accepted) failures.push(`Production dependency ${name} has an unaccepted ${finding.severity} vulnerability (${advisoryIds.join(', ') || 'advisory unavailable'}).`);
}

const metadata = full.report.metadata?.vulnerabilities ?? {};
console.log(`npm audit summary: critical=${metadata.critical ?? 0}, high=${metadata.high ?? 0}, moderate=${metadata.moderate ?? 0}, low=${metadata.low ?? 0}.`);
if ((metadata.moderate ?? 0) > 0) console.warn('Moderate findings are reported for review but do not block by policy unless production impact is upgraded to high or critical.');
if ((metadata.low ?? 0) > 0) console.warn('Low findings are advisory and retained in the uploaded audit report.');

if (failures.length) {
  console.error('Dependency audit policy failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Dependency audit policy passed with ${exceptions.length} active approved exception(s). High and critical production-relevant findings are blocking.`);
