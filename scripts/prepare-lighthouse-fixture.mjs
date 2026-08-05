import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import site from '../src/data/site.json' with { type: 'json' };
import { previewOrigin, publicRoutes, routeToHtmlPath } from './validation-routes.mjs';

if (site.previewMode !== true) throw new Error('Lighthouse fixture preparation expects the repository to remain in preview mode.');
const output = '.lighthouse-dist';
await rm(output, { recursive: true, force: true });
await cp('dist', output, { recursive: true });
await mkdir('.lighthouseci', { recursive: true });

for (const route of publicRoutes) {
  const file = routeToHtmlPath(route, output);
  let html = await readFile(file, 'utf8');
  html = html
    .replace('<meta name="robots" content="noindex, nofollow, noarchive">', '<meta name="robots" content="index, follow">')
    .replaceAll(previewOrigin, site.productionUrl.replace(/\/$/, ''));
  if (!html.includes('<meta name="robots" content="index, follow">')) throw new Error(`${route}: could not create production-readiness robots fixture`);
  await writeFile(file, html);
}

const sitemapPath = path.join(output, 'sitemap.xml');
const sitemap = (await readFile(sitemapPath, 'utf8')).replaceAll(previewOrigin, site.productionUrl.replace(/\/$/, ''));
await writeFile(sitemapPath, sitemap);
await writeFile(path.join(output, 'robots.txt'), [
  'User-agent: *',
  'Allow: /',
  `Sitemap: ${new URL('/sitemap.xml', site.productionUrl).toString()}`,
  ''
].join('\n'));

console.log(`Prepared isolated Lighthouse fixture at ${output}. Source build remains preview-blocked and unchanged.`);
