import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = path.join(repositoryRoot, 'dist');
const headersPath = path.join(distRoot, '_headers');
const hashPlaceholder = "'sha256-__BUILD_TIME_SCRIPT_HASHES__'";

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const resolved = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(resolved));
    else files.push(resolved);
  }
  return files;
}

const htmlFiles = (await filesUnder(distRoot)).filter((file) => file.endsWith('.html'));
const hashes = new Set();
let inlineScriptCount = 0;

for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, 'utf8');
  for (const match of html.matchAll(/<script(?<attributes>[^>]*)>(?<body>[\s\S]*?)<\/script>/gi)) {
    const attributes = match.groups?.attributes ?? '';
    const body = match.groups?.body ?? '';
    if (/\bsrc\s*=/i.test(attributes) || body.length === 0) continue;
    const digest = createHash('sha256').update(body, 'utf8').digest('base64');
    hashes.add(`'sha256-${digest}'`);
    inlineScriptCount += 1;
  }
}

if (inlineScriptCount === 0 || hashes.size === 0) {
  throw new Error('No inline scripts were found; refusing to emit an empty CSP hash policy.');
}

const originalHeaders = await readFile(headersPath, 'utf8');
if (originalHeaders.split(hashPlaceholder).length !== 2) {
  throw new Error('The CSP build-time hash placeholder must occur exactly once in dist/_headers.');
}

const hashSources = [...hashes].sort().join(' ');
const finalizedHeaders = originalHeaders.replace(hashPlaceholder, hashSources);
const cspLine = finalizedHeaders.split(/\r?\n/).find((line) => line.includes('Content-Security-Policy:')) ?? '';

if (cspLine.includes('__BUILD_TIME_SCRIPT_HASHES__') || /script-src[^;]*'unsafe-inline'/i.test(cspLine)) {
  throw new Error('Final CSP still contains a placeholder or script-src unsafe-inline.');
}
if (cspLine.length > 2_000) {
  throw new Error(`Final Content-Security-Policy header is ${cspLine.length} characters; Cloudflare Pages permits at most 2,000.`);
}

await writeFile(headersPath, finalizedHeaders, 'utf8');
console.log(`Finalized CSP with ${hashes.size} unique SHA-256 source(s) for ${inlineScriptCount} inline script block(s) across ${htmlFiles.length} HTML file(s); header length ${cspLine.length}.`);
