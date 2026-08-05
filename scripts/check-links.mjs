import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { previewOrigin } from './validation-routes.mjs';

const failures = [];
const htmlFiles = [];
const walk = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
};
await walk('dist');

const routeForFile = (file) => {
  const relative = path.relative('dist', file).split(path.sep).join('/');
  if (relative === 'index.html') return '/';
  if (relative.endsWith('/index.html')) return `/${relative.replace(/index\.html$/, '')}`;
  return `/${relative}`;
};
const idsFor = (html) => new Set([
  ...[...html.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]),
  ...[...html.matchAll(/\sname=["']([^"']+)["']/gi)].map((match) => match[1])
]);
const htmlByRoute = new Map();
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  htmlByRoute.set(routeForFile(file), { file, html, ids: idsFor(html) });
}

const internalTarget = async (pathname) => {
  const decoded = decodeURIComponent(pathname);
  if (decoded === '/') return { file: path.join('dist', 'index.html'), route: '/' };
  const relative = decoded.replace(/^\//, '');
  if (decoded.endsWith('/')) return { file: path.join('dist', relative, 'index.html'), route: decoded };
  if (path.extname(decoded)) return { file: path.join('dist', relative), route: decoded };
  return { file: path.join('dist', relative, 'index.html'), route: `${decoded}/` };
};

for (const [sourceRoute, page] of htmlByRoute) {
  const candidates = [];
  for (const regex of [
    /\s(?:href|src|action)=["']([^"']+)["']/gi,
    /\ssrcset=["']([^"']+)["']/gi
  ]) {
    for (const match of page.html.matchAll(regex)) {
      if (regex.source.includes('srcset')) {
        for (const part of match[1].split(',')) candidates.push(part.trim().split(/\s+/)[0]);
      } else candidates.push(match[1].trim());
    }
  }

  for (const candidate of candidates) {
    if (!candidate || /^(?:data:|mailto:|tel:|javascript:|blob:)/i.test(candidate)) continue;
    let targetUrl;
    try {
      targetUrl = new URL(candidate, new URL(sourceRoute, previewOrigin));
    } catch {
      failures.push(`${sourceRoute}: malformed URL ${candidate}`);
      continue;
    }
    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
      failures.push(`${sourceRoute}: unsupported URL protocol in ${candidate}`);
      continue;
    }
    if (targetUrl.origin !== previewOrigin) continue;

    const target = await internalTarget(targetUrl.pathname);
    try {
      await access(target.file);
    } catch {
      failures.push(`${sourceRoute}: internal target ${candidate} is missing (${target.file})`);
      continue;
    }
    if (targetUrl.hash && target.file.endsWith('.html')) {
      const fragment = decodeURIComponent(targetUrl.hash.slice(1));
      const targetPage = htmlByRoute.get(target.route);
      if (fragment && targetPage && !targetPage.ids.has(fragment)) failures.push(`${sourceRoute}: fragment ${candidate} does not exist`);
    }
  }
}

const redirects = await readFile('public/_redirects', 'utf8');
const redirectMap = new Map();
for (const line of redirects.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const [source, target] = trimmed.split(/\s+/);
  if (!source || !target || !target.startsWith('/')) continue;
  redirectMap.set(source, target);
}
for (const source of redirectMap.keys()) {
  const visited = new Set([source]);
  let current = redirectMap.get(source);
  while (current && redirectMap.has(current)) {
    if (visited.has(current)) {
      failures.push(`redirect loop detected from ${source} through ${current}`);
      break;
    }
    visited.add(current);
    current = redirectMap.get(current);
  }
}

if (failures.length) {
  console.error('Internal link validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Internal link validation passed across ${htmlFiles.length} generated HTML files, including assets, downloads, fragments, and redirect-loop checks.`);
