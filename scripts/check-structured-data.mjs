import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import site from '../src/data/site.json' with { type: 'json' };
import { previewOrigin, publicRoutes, noindexPrefixes, routeToHtmlPath } from './validation-routes.mjs';

const failures = [];
const forbiddenKeys = new Set([
  'aggregateRating', 'review', 'award', 'awards', 'acceptedInsurance', 'insuranceAccepted',
  'priceRange', 'hasCredential', 'knowsAbout', 'slogan'
]);
const expectedRoot = new URL('/', previewOrigin).toString();
const expectedDentistId = new URL('/#dentist', previewOrigin).toString();

const scriptsFrom = (html) => [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  .map((match) => match[1].trim());
const collectKeys = (value, keys = []) => {
  if (Array.isArray(value)) value.forEach((item) => collectKeys(item, keys));
  else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      keys.push(key);
      collectKeys(child, keys);
    }
  }
  return keys;
};
const findGeneratedHtml = async (root = 'dist', current = root, output = []) => {
  for (const entry of await readdir(current, { withFileTypes: true })) {
    const full = path.join(current, entry.name);
    if (entry.isDirectory()) await findGeneratedHtml(root, full, output);
    else if (entry.name === 'index.html') output.push(full);
  }
  return output;
};
const routeForFile = (file) => {
  const relative = path.relative('dist', file).split(path.sep).join('/');
  return relative === 'index.html' ? '/' : `/${relative.replace(/index\.html$/, '')}`;
};

for (const route of publicRoutes) {
  const html = await readFile(routeToHtmlPath(route), 'utf8');
  const scripts = scriptsFrom(html);
  if (scripts.length !== 1) {
    failures.push(`${route}: expected exactly one JSON-LD block; found ${scripts.length}`);
    continue;
  }
  let data;
  try {
    data = JSON.parse(scripts[0]);
  } catch (error) {
    failures.push(`${route}: JSON-LD does not parse: ${error.message}`);
    continue;
  }
  if (data['@context'] !== 'https://schema.org') failures.push(`${route}: JSON-LD @context must be https://schema.org`);
  const graph = Array.isArray(data['@graph']) ? data['@graph'] : [];
  const dentists = graph.filter((node) => node?.['@type'] === 'Dentist');
  const websites = graph.filter((node) => node?.['@type'] === 'WebSite');
  const webpages = graph.filter((node) => node?.['@type'] === 'WebPage');
  if (dentists.length !== 1) failures.push(`${route}: expected one Dentist entity; found ${dentists.length}`);
  if (websites.length !== 1) failures.push(`${route}: expected one WebSite entity; found ${websites.length}`);
  if (webpages.length !== 1) failures.push(`${route}: expected one WebPage entity; found ${webpages.length}`);
  const dentist = dentists[0];
  const webpage = webpages[0];
  if (!dentist || !webpage) continue;

  const expectedAddress = {
    '@type': 'PostalAddress',
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressRegion: site.address.state,
    postalCode: site.address.postalCode,
    addressCountry: 'US'
  };
  const expectedHours = site.hours
    .filter((item) => item.hours !== 'Closed')
    .map((item) => ({ day: `https://schema.org/${item.day}`, opens: '08:00', closes: '17:00' }));

  if (dentist['@id'] !== expectedDentistId) failures.push(`${route}: Dentist @id must be ${expectedDentistId}`);
  if (dentist['@type'] !== 'Dentist') failures.push(`${route}: business type must remain Dentist`);
  if (dentist.name !== site.practiceName) failures.push(`${route}: Dentist name differs from shared site data`);
  if (dentist.telephone !== site.phoneHref) failures.push(`${route}: Dentist telephone differs from shared site data`);
  if (dentist.url !== expectedRoot) failures.push(`${route}: Dentist URL differs from the preview origin`);
  if (JSON.stringify(dentist.address) !== JSON.stringify(expectedAddress)) failures.push(`${route}: Dentist address differs from shared site data`);
  if (dentist.image?.url !== new URL(site.socialImage, previewOrigin).toString()) failures.push(`${route}: Dentist image URL is inconsistent`);
  if (dentist.image?.width !== site.socialImageWidth || dentist.image?.height !== site.socialImageHeight) failures.push(`${route}: Dentist image dimensions are inconsistent`);
  if (!dentist.logo || dentist.logo.url !== new URL(site.logo, previewOrigin).toString()) failures.push(`${route}: Dentist logo must derive from shared site data`);

  const actualHours = (dentist.openingHoursSpecification ?? []).map((item) => ({
    day: item.dayOfWeek,
    opens: item.opens,
    closes: item.closes
  }));
  if (JSON.stringify(actualHours) !== JSON.stringify(expectedHours)) failures.push(`${route}: opening hours differ from the authoritative shared schedule`);
  if (webpage.url !== new URL(route, previewOrigin).toString()) failures.push(`${route}: WebPage URL is origin-inconsistent`);
  if (webpage.about?.['@id'] !== expectedDentistId) failures.push(`${route}: WebPage does not reference the single authoritative Dentist entity`);

  for (const key of collectKeys(data)) {
    if (forbiddenKeys.has(key)) failures.push(`${route}: unverified structured-data property ${key} is prohibited`);
  }
}

for (const file of await findGeneratedHtml()) {
  const route = routeForFile(file);
  if (!noindexPrefixes.some((prefix) => route.startsWith(prefix)) && route !== '/404-review-example/') continue;
  const scripts = scriptsFrom(await readFile(file, 'utf8'));
  for (const source of scripts) {
    try {
      const data = JSON.parse(source);
      const graph = Array.isArray(data['@graph']) ? data['@graph'] : [data];
      if (graph.some((node) => node?.['@type'] === 'Dentist' || node?.['@type'] === 'LocalBusiness')) {
        failures.push(`${route}: retained demo/review output must not emit public business schema`);
      }
    } catch (error) {
      failures.push(`${route}: JSON-LD does not parse: ${error.message}`);
    }
  }
}

if (site.previewMode !== true) failures.push('Structured-data validation must not disable previewMode.');
if (new URL(site.productionUrl).origin !== 'https://www.donovanfamilydentistry.com') failures.push('Production structured-data origin readiness is incorrect.');

if (failures.length) {
  console.error('Structured-data validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`Structured-data validation passed for ${publicRoutes.length} Classic pages with one shared Dentist entity per page and no business schema on retained noindex surfaces.`);
