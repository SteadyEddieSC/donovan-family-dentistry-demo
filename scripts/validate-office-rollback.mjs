import { appendFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const allowedOfficePaths = [
  /^src\/data\/(?:site|practice-content|providers|modern-team|services|forms)\.json$/,
  /^public\/images\/.+/,
  /^public\/forms\/.+/
];

export function validateOfficeRollback(subject, changedFiles) {
  if (!subject.startsWith('office update:')) return { ok: false, reason: 'The latest commit is not a Pages CMS office update.' };
  if (changedFiles.length === 0) return { ok: false, reason: 'The latest office update contains no changed files.' };
  const unexpected = changedFiles.find((file) => !allowedOfficePaths.some((pattern) => pattern.test(file)));
  if (unexpected) return { ok: false, reason: `The latest office update changed an unexpected path: ${unexpected}` };
  return { ok: true };
}

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

export function validateCurrentRepository() {
  const targetSha = git('rev-parse', 'HEAD');
  const targetSubject = git('log', '-1', '--pretty=%s');
  const changedFiles = git('diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD').split(/\r?\n/).filter(Boolean);
  const result = validateOfficeRollback(targetSubject, changedFiles);
  if (!result.ok) throw new Error(`${result.reason} Nothing was changed; ask the website administrator for help.`);
  return { targetSha, targetSubject, changedFiles };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = validateCurrentRepository();
    if (process.env.GITHUB_OUTPUT) {
      appendFileSync(process.env.GITHUB_OUTPUT, `target_sha=${result.targetSha}\ntarget_subject=${result.targetSubject}\n`);
    }
    console.log(`Safe office rollback target validated: ${result.targetSha} (${result.changedFiles.length} allowed file(s)).`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
