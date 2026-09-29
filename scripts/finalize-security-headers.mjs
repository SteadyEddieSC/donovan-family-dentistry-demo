import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

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

function inlineScriptBodies(html) {
  const document = parse(html, { sourceCodeLocationInfo: true });
  const bodies = [];

  function visit(node) {
    if (node.nodeName === 'script') {
      const hasSrc = (node.attrs ?? []).some((attribute) => attribute.name.toLowerCase() === 'src');
      if (!hasSrc) {
        const location = node.sourceCodeLocation;
        if (!location?.startTag || !location?.endTag) {
          throw new Error('Inline script is missing source locations; refusing to calculate a normalized CSP hash.');
        }
        const body = html.slice(location.startTag.endOffset, location.endTag.startOffset);
        if (body.length > 0) bodies.push(body);
      }
    }

    for (const child of node.childNodes ?? []) visit(child);
    if (node.content) visit(node.content);
  }

  visit(document);
  return bodies;
}

const htmlFiles = (await filesUnder(distRoot)).filter((file) => file.endsWith('.html'));
const hashes = new Set();
let inlineScriptCount = 0;

for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, 'utf8');
  for (const body of inlineScriptBodies(html)) {
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
