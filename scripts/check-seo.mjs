import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import site from '../src/data/site.json' with { type: 'json' };
import { previewOrigin, publicRoutes, noindexPrefixes, utilityRoutes, routeToHtmlPath, normalizeRoute } from './validation-routes.mjs';

const failures = [];
const pages = new Map();
const productionOrigin = new URL(site.productionUrl).origin;
const placeholderPatterns = [
  /\blorem ipsum\b/i,
  /\bplaceholder(?: copy| text| content)?\b/i,
  /\beditor(?:'s)? note\b/i,
  /\btemplate language\b/i,
  /\binternal approval\b/i,
  /\breplace this\b/i,
  /\bTODO\b/
];

const decode = (value = '') => value
  .replaceAll('&amp;', '&')
  .replaceAll('&quot;', '"')
  .replaceAll('&#39;', "'")
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>')
  .trim();

const matchAll = (html, regex) => [...html.matchAll(regex)];
const getAttribute = (tag, name) => {
  const match = tag.match(new RegExp(`\\s${name}=["']([^"']*)["']`, 'i'));
  return match ? decode(match[1]) : null;
};
const tagsBy = (html, tagName) => matchAll(html, new RegExp(`<${tagName}\\b[^>]*>`, 'gi')).map((match) => match[0]);
const metaBy = (html, attribute, value) => tagsBy(html, 'meta').filter((tag) => getAttribute(tag, attribute)?.toLowerCase() === value.toLowerCase());
const linkByRel = (html, rel) => tagsBy(html, 'link').filter((tag) => (getAttribute(tag, 'rel') ?? '').toLowerCase().split(/\s+/).includes(rel));
const textOf = (html, tagName) => matchAll(html, new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'gi'))
  .map((match) => decode(match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')));

for (const route of publicRoutes) {
  const file = routeToHtmlPath(route);
  try {
    await access(file);
  } catch {
    failures.push(`${route}: generated HTML is missing at ${file}`);
    continue;
  }
  const html = await readFile(file, 'utf8');
  const titles = textOf(html, 'title');
  const descriptions = metaBy(html, 'name', 'description');
  const canonicals = linkByRel(html, 'canonical');
  const h1s = textOf(html, 'h1').filter(Boolean);
  const robotsTags = metaBy(html, 'name', 'robots');
  const ogTitle = metaBy(html, 'property', 'og:title');
  const ogDescription = metaBy(html, 'property', 'og:description');
  const ogUrl = metaBy(html, 'property', 'og:url');
  const ogImage = metaBy(html, 'property', 'og:image');
  const ogImageAlt = metaBy(html, 'property', 'og:image:alt');
  const ogImageWidth = metaBy(html, 'property', 'og:image:width');
  const ogImageHeight = metaBy(html, 'property', 'og:image:height');

  const requireExactlyOne = (items, label) => {
    if (items.length !== 1) failures.push(`${route}: expected exactly one ${label}; found ${items.length}`);
  };
  requireExactlyOne(titles, '<title>');
  requireExactlyOne(descriptions, 'meta description');
  requireExactlyOne(canonicals, 'canonical URL');
  requireExactlyOne(h1s, 'meaningful H1');
  requireExactlyOne(robotsTags, 'robots meta directive');
  requireExactlyOne(ogTitle, 'Open Graph title');
  requireExactlyOne(ogDescription, 'Open Graph description');
  requireExactlyOne(ogUrl, 'Open Graph URL');
  requireExactlyOne(ogImage, 'Open Graph image');
  requireExactlyOne(ogImageAlt, 'Open Graph image alt text');
  requireExactlyOne(ogImageWidth, 'Open Graph image width');
  requireExactlyOne(ogImageHeight, 'Open Graph image height');

  const title = titles[0] ?? '';
  const description = descriptions[0] ? getAttribute(descriptions[0], 'content') ?? '' : '';
  const canonical = canonicals[0] ? getAttribute(canonicals[0], 'href') ?? '' : '';
  const robots = robotsTags[0] ? getAttribute(robotsTags[0], 'content') ?? '' : '';
  const expectedPreviewCanonical = new URL(route, previewOrigin).toString();
  const expectedProductionCanonical = new URL(route, productionOrigin).toString();

  if (title.length < 20 || title.length > 70) failures.push(`${route}: title length ${title.length} is outside the supported 20–70 character range`);
  if (description.length < 80 || description.length > 180) failures.push(`${route}: description length ${description.length} is outside the supported 80–180 character range`);
  if ((h1s[0] ?? '').length < 8) failures.push(`${route}: H1 is not meaningful`);
  if (canonical !== expectedPreviewCanonical) failures.push(`${route}: preview canonical must be ${expectedPreviewCanonical}, found ${canonical || '(missing)'}`);
  if (!expectedProductionCanonical.startsWith(`${productionOrigin}/`)) failures.push(`${route}: production canonical readiness is invalid`);
  if (site.previewMode && !/\bnoindex\b/i.test(robots)) failures.push(`${route}: preview mode must emit noindex`);
  if (site.previewMode && !/\bnofollow\b/i.test(robots)) failures.push(`${route}: preview mode must emit nofollow`);
  if (/\bindex\b/i.test(robots.replace(/noindex/gi, ''))) failures.push(`${route}: preview robots directive conflicts with noindex`);

  const expectedOgPairs = [
    [ogTitle[0], 'content', title, 'og:title'],
    [ogDescription[0], 'content', description, 'og:description'],
    [ogUrl[0], 'content', canonical, 'og:url'],
    [ogImageWidth[0], 'content', String(site.socialImageWidth), 'og:image:width'],
    [ogImageHeight[0], 'content', String(site.socialImageHeight), 'og:image:height']
  ];
  for (const [tag, attribute, expected, label] of expectedOgPairs) {
    if (tag && getAttribute(tag, attribute) !== expected) failures.push(`${route}: ${label} does not match authoritative metadata`);
  }
  const imageUrl = ogImage[0] ? getAttribute(ogImage[0], 'content') : null;
  if (imageUrl !== new URL(site.socialImage, previewOrigin).toString()) failures.push(`${route}: social image URL is not preview-origin consistent`);
  if (!(ogImageAlt[0] && getAttribute(ogImageAlt[0], 'content')?.trim())) failures.push(`${route}: social image alt text is empty`);

  for (const pattern of placeholderPatterns) {
    if (pattern.test(html)) failures.push(`${route}: public output contains prohibited placeholder/editor language matching ${pattern}`);
  }

  const anchors = tagsBy(html, 'a')
    .map((tag) => getAttribute(tag, 'href'))
    .filter(Boolean);
  pages.set(route, { title, description, canonical, robots, html, anchors });
}

const duplicateValues = (field) => {
  const seen = new Map();
  for (const [route, page] of pages) {
    const value = page[field];
    if (!value) continue;
    seen.set(value, [...(seen.get(value) ?? []), route]);
  }
  return [...seen.entries()].filter(([, routes]) => routes.length > 1);
};
for (const [value, routes] of duplicateValues('title')) failures.push(`duplicate public title on ${routes.join(', ')}: ${value}`);
for (const [value, routes] of duplicateValues('description')) failures.push(`duplicate public description on ${routes.join(', ')}: ${value}`);

const graph = new Map();
for (const [route, page] of pages) {
  const links = new Set();
  for (const href of page.anchors) {
    if (/^(?:https?:|mailto:|tel:|javascript:|data:)/i.test(href) || href.startsWith('#')) continue;
    try {
      const target = new URL(href, new URL(route, previewOrigin));
      if (target.origin === previewOrigin) links.add(normalizeRoute(target.pathname));
    } catch {
      failures.push(`${route}: malformed internal URL ${href}`);
    }
  }
  graph.set(route, links);
}
const reachable = new Set(['/']);
const queue = ['/'];
while (queue.length) {
  const current = queue.shift();
  for (const target of graph.get(current) ?? []) {
    if (publicRoutes.includes(target) && !reachable.has(target)) {
      reachable.add(target);
      queue.push(target);
    }
  }
}
for (const route of publicRoutes) {
  if (!reachable.has(route)) failures.push(`${route}: intended public page is not internally reachable from the Classic homepage`);
}

const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => decode(match[1]));
for (const route of publicRoutes) {
  const expected = new URL(route, previewOrigin).toString();
  if (sitemapUrls.filter((url) => url === expected).length !== 1) failures.push(`${route}: sitemap must contain exactly one ${expected}`);
}
for (const url of sitemapUrls) {
  const parsed = new URL(url);
  if (parsed.origin !== previewOrigin) failures.push(`sitemap URL ${url} does not use the preview origin while preview mode is active`);
  if (noindexPrefixes.some((prefix) => parsed.pathname.startsWith(prefix)) || utilityRoutes.includes(normalizeRoute(parsed.pathname))) {
    failures.push(`sitemap improperly includes noindex/utility URL ${url}`);
  }
}
if (sitemapUrls.length !== publicRoutes.length) failures.push(`sitemap contains ${sitemapUrls.length} URLs; expected ${publicRoutes.length}`);

if (site.previewMode !== true) failures.push('This release must preserve previewMode=true; production indexing is not authorized.');
if (productionOrigin !== 'https://www.donovanfamilydentistry.com') failures.push(`Unexpected production origin ${productionOrigin}`);

if (failures.length) {
  console.error('SEO validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`SEO validation passed for ${pages.size} Classic public pages. Preview noindex and Pages canonicals remain active; production canonical readiness resolves to ${productionOrigin}.`);
