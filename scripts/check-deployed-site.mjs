const base = new URL(process.env.SITE_URL || 'https://donovanfamilydentistry.com');
const canonicalOrigin = new URL('https://donovanfamilydentistry.com');
const timeoutMs = Number(process.env.SITE_CHECK_TIMEOUT_MS || 15_000);

async function get(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'Donovan-production-candidate-monitor/1.0' }
    });
  } finally {
    clearTimeout(timer);
  }
}

function absolute(pathOrUrl) {
  return new URL(pathOrUrl, base);
}

function internalLinks(html, pageUrl) {
  const values = [...html.matchAll(/\bhref=["']([^"']+)["']/gi)].map((match) => match[1]);
  const links = new Set();
  for (const value of values) {
    if (!value || value.startsWith('#') || /^(tel:|mailto:|javascript:|data:)/i.test(value)) continue;
    const resolved = new URL(value, pageUrl);
    if (
      resolved.origin !== base.origin ||
      resolved.pathname.startsWith('/api/') ||
      resolved.pathname.startsWith('/cdn-cgi/')
    ) {
      continue;
    }
    resolved.hash = '';
    links.add(resolved.toString());
  }
  return links;
}

const failures = [];
const sitemapResponse = await get(absolute('/sitemap.xml'));
if (!sitemapResponse.ok) failures.push(`Sitemap returned ${sitemapResponse.status}.`);
const sitemap = await sitemapResponse.text();
const canonicalPageUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
if (canonicalPageUrls.length !== 7) failures.push(`Sitemap must contain exactly 7 Classic page URLs; found ${canonicalPageUrls.length}.`);
for (const canonicalUrl of canonicalPageUrls) {
  if (new URL(canonicalUrl).origin !== canonicalOrigin.origin) failures.push(`Sitemap URL ${canonicalUrl} does not use the production canonical origin.`);
  if (new URL(canonicalUrl).pathname.startsWith('/modern/') || new URL(canonicalUrl).pathname.startsWith('/review/')) failures.push(`Sitemap URL ${canonicalUrl} exposes a retained noindex route.`);
}

const pageUrls = canonicalPageUrls.map((canonicalUrl) => {
  const canonical = new URL(canonicalUrl);
  return new URL(`${canonical.pathname}${canonical.search}`, base).toString();
});

const links = new Set([
  absolute('/robots.txt').toString(),
  absolute('/forms/Donovan-Medical-History-3-17.pdf').toString(),
  absolute('/forms/donovan-family-dentistry-privacy-policy.pdf').toString(),
  absolute('/images/donovan-social-card.webp').toString()
]);

for (const pageUrl of pageUrls) {
  const response = await get(pageUrl);
  if (!response.ok) {
    failures.push(`${pageUrl} returned ${response.status}.`);
    continue;
  }
  const html = await response.text();
  if (!/<main\b/i.test(html)) failures.push(`${pageUrl} has no main landmark.`);
  if (!/name=["']robots["'][^>]*content=["']index, follow["']/i.test(html)) {
    failures.push(`${pageUrl} is missing production index/follow metadata.`);
  }
  const expectedCanonical = new URL(new URL(pageUrl).pathname, canonicalOrigin).toString();
  if (!html.includes(`rel="canonical" href="${expectedCanonical}"`)) failures.push(`${pageUrl} is missing canonical ${expectedCanonical}.`);
  for (const link of internalLinks(html, pageUrl)) links.add(link);

}

for (const retainedPath of ['/modern/', '/review/']) {
  const retainedUrl = absolute(retainedPath);
  const response = await get(retainedUrl);
  if (!response.ok) {
    failures.push(`${retainedUrl} returned ${response.status}.`);
    continue;
  }
  const html = await response.text();
  if (!/name=["']robots["'][^>]*content=["']noindex, nofollow, noarchive["']/i.test(html)) failures.push(`${retainedUrl} is missing permanent noindex metadata.`);
  if (!/noindex/i.test(response.headers.get('x-robots-tag') ?? '')) failures.push(`${retainedUrl} is missing response-level noindex protection.`);
}

for (const link of links) {
  const response = await get(link);
  if (!response.ok) failures.push(`${link} returned ${response.status}.`);
}

const robotsResponse = await get(absolute('/robots.txt'));
const robots = await robotsResponse.text();
if (!robots.includes('User-agent: *\nAllow: /')) failures.push('Deployed robots.txt does not allow Classic crawling.');
if (!robots.includes(`Sitemap: ${canonicalOrigin.origin}/sitemap.xml`)) failures.push('Deployed robots.txt does not advertise the production sitemap.');

if (failures.length > 0) {
  console.error(`Deployed production-candidate check failed for ${base.origin}:`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Deployed production-candidate check passed for ${base.origin}: ${pageUrls.length} sitemap page(s) and ${links.size} internal asset/link target(s) resolved.`);
