import { resolve4, resolveMx, resolveNs, resolveTxt } from 'node:dns/promises';

const base = new URL(process.env.SITE_URL || 'https://donovanfamilydentistry.com');
const canonicalOrigin = new URL('https://donovanfamilydentistry.com');
const timeoutMs = Number(process.env.SITE_CHECK_TIMEOUT_MS || 15_000);
const isProduction = base.origin === canonicalOrigin.origin;
const classicPaths = ['/', '/about/', '/services/', '/forms/', '/contact/', '/accessibility/', '/website-use/'];

async function request(url, redirect = 'follow') {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      redirect,
      signal: controller.signal,
      headers: { 'User-Agent': 'Donovan-production-monitor/2.0' }
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

function insecureResourceReferences(html) {
  return [
    ...html.matchAll(/\b(?:src|srcset|action|poster)=["']([^"']*\bhttp:\/\/[^"']*)["']/gi),
    ...html.matchAll(/url\(\s*["']?(http:\/\/[^)'"\s]+)/gi)
  ].map((match) => match[1]);
}

function directive(policy, name) {
  return policy.match(new RegExp(`(?:^|;\\s*)${name}\\s+([^;]+)`, 'i'))?.[1].trim() ?? '';
}

function cacheDirectives(response) {
  return new Set((response.headers.get('cache-control') ?? '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean));
}

async function expectPermanentRedirect(source, expected, label, failures) {
  const response = await request(source, 'manual');
  const location = response.headers.get('location');
  const resolvedLocation = location ? new URL(location, source).toString() : null;
  if (![301, 308].includes(response.status) || resolvedLocation !== expected.toString()) {
    failures.push(`${label} must permanently redirect directly to ${expected}; received ${response.status} ${location ?? '(no Location header)'}.`);
  }
}

async function checkProductionDns(failures) {
  try {
    const nameservers = (await resolveNs('donovanfamilydentistry.com')).map((value) => value.toLowerCase().replace(/\.$/, '')).sort();
    const expected = ['nick.ns.cloudflare.com', 'tina.ns.cloudflare.com'];
    if (JSON.stringify(nameservers) !== JSON.stringify(expected)) failures.push(`Authoritative NS mismatch: ${nameservers.join(', ') || '(none)'}.`);

    const mx = await resolveMx('donovanfamilydentistry.com');
    if (mx.length !== 1 || mx[0].priority !== 0 || mx[0].exchange.toLowerCase().replace(/\.$/, '') !== 'donovanfamilydentistry-com.mail.protection.outlook.com') {
      failures.push(`MX mismatch: ${JSON.stringify(mx)}.`);
    }

    const txt = (await resolveTxt('donovanfamilydentistry.com')).map((parts) => parts.join(''));
    if (!txt.includes('v=spf1 include:secureserver.net -all')) failures.push('Approved SPF record is missing.');
    if (!txt.includes('NETORGFT12395633.onmicrosoft.com')) failures.push('Microsoft 365 tenant-verification record is missing.');

    for (const host of ['cpanel', 'ftp', 'webdisk', 'whm']) {
      const addresses = await resolve4(`${host}.donovanfamilydentistry.com`);
      if (addresses.length !== 1 || addresses[0] !== '107.180.115.120') failures.push(`${host} legacy host mismatch: ${addresses.join(', ') || '(none)'}.`);
    }
  } catch (error) {
    failures.push(`Production DNS check failed: ${error.message}`);
  }
}

const failures = [];
const rootResponse = await request(base);
const rootHtml = await rootResponse.text();
const csp = rootResponse.headers.get('content-security-policy') ?? '';

if (!rootResponse.ok || !/<main\b/i.test(rootHtml) || !/Donovan Family Dentistry/i.test(rootHtml)) {
  failures.push(`Site root did not return the intended website (status ${rootResponse.status}).`);
}
if (!csp) failures.push('Content-Security-Policy header is missing.');
if (/['"]?unsafe-eval['"]?/i.test(csp)) failures.push('CSP permits unsafe-eval.');
if (/\bscript-src\b[^;]*'unsafe-inline'/i.test(csp)) failures.push('CSP script-src permits unsafe-inline.');
const scriptSources = directive(csp, 'script-src').split(/\s+/).filter(Boolean);
const approvedScriptSources = new Set(["'self'", 'https://static.cloudflareinsights.com', 'https://challenges.cloudflare.com']);
for (const source of scriptSources) {
  if (!approvedScriptSources.has(source) && !/^'sha256-[A-Za-z0-9+/]+={0,2}'$/.test(source)) failures.push(`CSP script-src contains unexpected source ${source}.`);
}
for (const requiredSource of approvedScriptSources) {
  if (!scriptSources.includes(requiredSource)) failures.push(`CSP script-src is missing ${requiredSource}.`);
}

if (isProduction) {
  const hsts = rootResponse.headers.get('strict-transport-security') ?? '';
  const maxAge = Number(hsts.match(/(?:^|;)\s*max-age=(\d+)/i)?.[1] ?? NaN);
  if (!Number.isFinite(maxAge) || maxAge < 2_592_000) failures.push(`Production HSTS max-age must be at least 2592000; received ${hsts || '(missing)'}.`);
  if (/\bincludesubdomains\b/i.test(hsts)) failures.push('Production HSTS unexpectedly enables includeSubDomains.');
  if (/\bpreload\b/i.test(hsts)) failures.push('Production HSTS unexpectedly enables preload.');

  await expectPermanentRedirect(
    new URL('http://donovanfamilydentistry.com/monitor-path/?source=http'),
    new URL('https://donovanfamilydentistry.com/monitor-path/?source=http'),
    'Apex HTTP',
    failures
  );
  await expectPermanentRedirect(
    new URL('https://www.donovanfamilydentistry.com/monitor-path/?source=www'),
    new URL('https://donovanfamilydentistry.com/monitor-path/?source=www'),
    'HTTPS www',
    failures
  );

  for (const [sourcePath, targetPath] of [
    ['/procedures/?source=legacy', '/services/?source=legacy'],
    ['/patient-forms/?source=legacy', '/forms/?source=legacy'],
    ['/directions/?source=legacy', '/contact/?source=legacy']
  ]) {
    await expectPermanentRedirect(absolute(sourcePath), absolute(targetPath), `Legacy route ${sourcePath.split('?')[0]}`, failures);
  }

  const notFound = await request(absolute('/__donovan-monitor-not-found__/'), 'manual');
  if (notFound.status !== 404) failures.push(`Representative nonexistent route returned ${notFound.status}, not 404.`);

  if (process.env.SKIP_PRODUCTION_DNS_CHECKS !== 'true') await checkProductionDns(failures);
}

const sitemapResponse = await request(absolute('/sitemap.xml'));
if (!sitemapResponse.ok) failures.push(`Sitemap returned ${sitemapResponse.status}.`);
const sitemap = await sitemapResponse.text();
const canonicalPageUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const expectedCanonicalUrls = classicPaths.map((path) => new URL(path, canonicalOrigin).toString());
if (JSON.stringify(canonicalPageUrls) !== JSON.stringify(expectedCanonicalUrls)) {
  failures.push(`Sitemap URLs differ from the intended Classic set: ${canonicalPageUrls.join(', ') || '(none)'}.`);
}

const pageUrls = classicPaths.map((path) => absolute(path).toString());
const astroAssets = new Set();
const links = new Set([
  absolute('/robots.txt').toString(),
  absolute('/forms/Donovan-Medical-History-3-17.pdf').toString(),
  absolute('/forms/donovan-family-dentistry-privacy-policy.pdf').toString(),
  absolute('/images/donovan-social-card.webp').toString()
]);

for (const pageUrl of pageUrls) {
  const response = await request(pageUrl);
  if (!response.ok) {
    failures.push(`${pageUrl} returned ${response.status}.`);
    continue;
  }
  const html = await response.text();
  if (!/<main\b/i.test(html)) failures.push(`${pageUrl} has no main landmark.`);
  if (!/name=["']robots["'][^>]*content=["']index, follow["']/i.test(html)) failures.push(`${pageUrl} is missing production index/follow metadata.`);
  const expectedCanonical = new URL(new URL(pageUrl).pathname, canonicalOrigin).toString();
  if (!html.includes(`rel="canonical" href="${expectedCanonical}"`)) failures.push(`${pageUrl} is missing canonical ${expectedCanonical}.`);
  const insecure = insecureResourceReferences(html);
  if (insecure.length > 0) failures.push(`${pageUrl} contains insecure first-party resource reference(s): ${insecure.join(', ')}.`);
  for (const match of html.matchAll(/(?:src|href)=["'](\/_astro\/[^"']+)["']/gi)) astroAssets.add(match[1]);
  for (const link of internalLinks(html, pageUrl)) {
    if (new URL(link).pathname.startsWith('/modern/')) failures.push(`${pageUrl} exposes Modern in Classic navigation/content: ${link}.`);
    links.add(link);
  }
}

for (const retainedPath of ['/modern/', '/review/']) {
  const retainedUrl = absolute(retainedPath);
  const response = await request(retainedUrl);
  if (!response.ok) {
    failures.push(`${retainedUrl} returned ${response.status}.`);
    continue;
  }
  const html = await response.text();
  if (!/name=["']robots["'][^>]*content=["']noindex, nofollow, noarchive["']/i.test(html)) failures.push(`${retainedUrl} is missing permanent noindex metadata.`);
  if (!/noindex/i.test(response.headers.get('x-robots-tag') ?? '')) failures.push(`${retainedUrl} is missing response-level noindex protection.`);
  if (retainedPath === '/review/' && !cacheDirectives(response).has('no-store')) failures.push(`${retainedUrl} is missing no-store caching.`);
}

const apiResponse = await request(absolute('/api/administrative-inquiry'), 'manual');
if (!cacheDirectives(apiResponse).has('no-store')) failures.push('/api/administrative-inquiry is missing no-store caching.');

for (const pdfPath of ['/forms/Donovan-Medical-History-3-17.pdf', '/forms/donovan-family-dentistry-privacy-policy.pdf']) {
  const response = await request(absolute(pdfPath));
  const cache = cacheDirectives(response);
  const expectedPdfMaxAge = isProduction ? 'max-age=14400' : 'max-age=3600';
  if (!response.ok) failures.push(`${absolute(pdfPath)} returned ${response.status}.`);
  if (!cache.has('public') || !cache.has(expectedPdfMaxAge) || cache.has('immutable')) failures.push(`${absolute(pdfPath)} does not retain the established ${expectedPdfMaxAge} PDF behavior for this environment.`);
}

const currentAstroAsset = [...astroAssets][0];
if (!currentAstroAsset) {
  failures.push('No current /_astro/* asset could be discovered dynamically from Classic HTML.');
} else {
  const assetResponse = await request(absolute(currentAstroAsset));
  const cache = cacheDirectives(assetResponse);
  if (!assetResponse.ok) failures.push(`${absolute(currentAstroAsset)} returned ${assetResponse.status}.`);
  if (!cache.has('public') || !cache.has('max-age=31536000') || !cache.has('immutable')) failures.push(`${absolute(currentAstroAsset)} is missing immutable one-year caching.`);
}

for (const link of links) {
  const response = await request(link);
  if (!response.ok) failures.push(`${link} returned ${response.status}.`);
}

const robotsResponse = await request(absolute('/robots.txt'));
const robots = await robotsResponse.text();
if (!robots.includes('User-agent: *\nAllow: /')) failures.push('Deployed robots.txt does not allow Classic crawling.');
if (!robots.includes(`Sitemap: ${canonicalOrigin.origin}/sitemap.xml`)) failures.push('Deployed robots.txt does not advertise the production sitemap.');

if (failures.length > 0) {
  console.error(`Deployed site check failed for ${base.origin}:`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Deployed site check passed for ${base.origin}: ${pageUrls.length} intended Classic page(s), ${links.size} internal target(s)${isProduction ? ', production redirects/security/DNS healthy' : ''}.`);
