const base = new URL(process.env.SITE_URL || 'https://donovan-family-dentistry-demo.pages.dev');
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
    if (resolved.origin !== base.origin || resolved.pathname.startsWith('/api/')) continue;
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
if (canonicalPageUrls.length < 14) failures.push(`Sitemap contains only ${canonicalPageUrls.length} page URL(s).`);

const pageUrls = canonicalPageUrls.map((canonicalUrl) => {
  const canonical = new URL(canonicalUrl);
  return new URL(`${canonical.pathname}${canonical.search}`, base).toString();
});

const links = new Set([
  absolute('/robots.txt').toString(),
  absolute('/forms/new-patient-medical-history.pdf').toString(),
  absolute('/forms/privacy-practices.pdf').toString(),
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
  if (!/name=["']robots["'][^>]*content=["']noindex, nofollow, noarchive["']/i.test(html)) {
    failures.push(`${pageUrl} is missing the preview noindex metadata.`);
  }
  for (const link of internalLinks(html, pageUrl)) links.add(link);

  if (new URL(pageUrl).pathname === '/modern/contact/') {
    if (!/data-mode=["']preview["']/i.test(html)) failures.push('The deployed contact page is not in preview mode.');
    if (!/>Preview request</i.test(html)) failures.push('The deployed contact page is missing the preview submit label.');
  }
}

for (const link of links) {
  const response = await get(link);
  if (!response.ok) failures.push(`${link} returned ${response.status}.`);
}

const robotsResponse = await get(absolute('/robots.txt'));
const robots = await robotsResponse.text();
if (!robots.includes('Disallow: /')) failures.push('Deployed robots.txt does not block crawling.');

if (failures.length > 0) {
  console.error(`Deployed production-candidate check failed for ${base.origin}:`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Deployed production-candidate check passed for ${base.origin}: ${pageUrls.length} sitemap page(s) and ${links.size} internal asset/link target(s) resolved.`);
