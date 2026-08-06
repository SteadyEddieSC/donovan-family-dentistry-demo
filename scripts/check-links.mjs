import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { previewOrigin, utilityRoutes } from './validation-routes.mjs';

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
const attributeOf = (tag, name) => tag.match(new RegExp(`\\s${name}=["']([^"']+)["']`, 'i'))?.[1] ?? null;
const htmlByRoute = new Map();
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  htmlByRoute.set(routeForFile(file), { file, html, ids: idsFor(html) });
}

const internalTarget = async (pathname) => {
  const decoded = decodeURIComponent(pathname);
  if (decoded === '/') return { file: path.join('dist', 'index.html'), route: '/' };
  if (utilityRoutes.includes(decoded.endsWith('/') ? decoded : `${decoded}/`)) {
    return { file: path.join('dist', '404.html'), route: '/404.html' };
  }
  if (decoded.startsWith('/api/')) {
    const relative = decoded.replace(/^\/api\//, '');
    return { file: path.join('functions', 'api', `${relative}.js`), route: decoded, functionRoute: true };
  }
  const relative = decoded.replace(/^\//, '');
  if (decoded.endsWith('/')) return { file: path.join('dist', relative, 'index.html'), route: decoded };
  if (path.extname(decoded)) return { file: path.join('dist', relative), route: decoded };
  return { file: path.join('dist', relative, 'index.html'), route: `${decoded}/` };
};

const collectCandidates = (html) => {
  const candidates = [];
  for (const match of html.matchAll(/<a\b[^>]*\shref=["']([^"']+)["'][^>]*>/gi)) candidates.push(match[1].trim());
  for (const match of html.matchAll(/<(?:img|script|source|video|audio)\b[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi)) candidates.push(match[1].trim());
  for (const match of html.matchAll(/<form\b[^>]*\saction=["']([^"']+)["'][^>]*>/gi)) candidates.push(match[1].trim());
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    const rel = (attributeOf(tag, 'rel') ?? '').toLowerCase().split(/\s+/);
    if (rel.includes('canonical')) continue;
    const href = attributeOf(tag, 'href');
    if (href) candidates.push(href.trim());
  }
  for (const match of html.matchAll(/\ssrcset=["']([^"']+)["']/gi)) {
    for (const part of match[1].split(',')) candidates.push(part.trim().split(/\s+/)[0]);
  }
  return candidates;
};

for (const [sourceRoute, page] of htmlByRoute) {
  for (const candidate of collectCandidates(page.html)) {
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
    let functionSource = null;
    try {
      if (target.functionRoute) functionSource = await readFile(target.file, 'utf8');
      else await access(target.file);
    } catch {
      failures.push(`${sourceRoute}: internal target ${candidate} is missing (${target.file})`);
      continue;
    }
    if (functionSource !== null && !/export\s+const\s+onRequest\b/.test(functionSource)) {
      failures.push(`${sourceRoute}: function target ${candidate} does not export onRequest`);
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
console.log(`Internal link validation passed across ${htmlFiles.length} generated HTML files, including assets, downloads, fragments, Cloudflare Functions, intentional 404 review probes, and redirect-loop checks.`);
