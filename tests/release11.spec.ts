import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configuredSite = 'https://donovan-family-dentistry-demo.pages.dev';

for (const route of ['/', '/modern/', '/modern/new-patients/']) {
  test(`${route} exposes complete preview-safe metadata`, async ({ page }) => {
    await page.goto(route);

    const title = await page.title();
    expect(title.length).toBeGreaterThan(20);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Donovan Family Dentistry|dental|patient/i);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow, noarchive');
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/site.webmanifest');
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Donovan Family Dentistry');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\//);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBe(`${configuredSite}${route}`);

    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(jsonLd).not.toBeNull();
    const parsed = JSON.parse(jsonLd ?? '{}');
    const graph: any[] = parsed['@graph'];
    expect(Array.isArray(graph)).toBeTruthy();

    const dentist = graph.find((item) => item['@type'] === 'Dentist');
    expect(dentist).toBeTruthy();
    expect(dentist.name).toBe('Donovan Family Dentistry');
    expect(dentist.telephone).toBe('+18435256866');
    expect(dentist.address.streetAddress).toBe('91 Sams Point Road');
    expect(dentist.openingHoursSpecification[0].opens).toBe('08:00');
    expect(dentist.openingHoursSpecification[0].closes).toBe('17:00');

    const webPage = graph.find((item) => item['@type'] === 'WebPage');
    expect(webPage).toBeTruthy();
    expect(webPage.url).toBe(canonical);
    expect(webPage.name).toBe(title);
  });
}

test('web manifest is valid and points to the modern patient experience', async ({ request }) => {
  const response = await request.get('/site.webmanifest');
  expect(response.status()).toBe(200);
  const manifest = JSON.parse(await response.text());
  expect(manifest.name).toBe('Donovan Family Dentistry');
  expect(manifest.start_url).toBe('/modern/');
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons[0].src).toBe('/favicon.svg');
});

test('content verification register tracks launch blockers and nonblocking follow-ups separately', async ({ isMobile }) => {
  test.skip(isMobile, 'Repository-level validation only needs to run once.');
  const register = JSON.parse(
    readFileSync(path.join(repositoryRoot, 'src/data/content-status.json'), 'utf8')
  );
  const blockerIds = register.launchBlockers.map((item: { id: string }) => item.id);
  const followUpIds = register.editorialFollowUps.map((item: { id: string }) => item.id);
  expect(new Set(blockerIds).size).toBe(blockerIds.length);
  expect(new Set(followUpIds).size).toBe(followUpIds.length);
  expect(blockerIds).toContain('provider-roster');
  expect(blockerIds).toContain('services');
  expect(blockerIds).toContain('production-integrations');
  expect(followUpIds).not.toContain('associate-dentist');
  expect(followUpIds).toContain('staff-roster');
  expect(register.launchBlockers.every((item: { replacementNeeded?: string }) => Boolean(item.replacementNeeded))).toBeTruthy();
});

test('launch gate allows preview builds and blocks premature public promotion', async ({ isMobile }) => {
  test.skip(isMobile, 'Repository-level validation only needs to run once.');

  const preview = spawnSync(process.execPath, ['scripts/check-launch-readiness.mjs'], {
    cwd: repositoryRoot,
    encoding: 'utf8'
  });
  expect(preview.status).toBe(0);
  expect(preview.stdout).toContain('preview mode is active');

  const productionAttempt = spawnSync(process.execPath, ['scripts/check-launch-readiness.mjs'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: { ...process.env, LAUNCH_PREVIEW_MODE: 'false' }
  });
  expect(productionAttempt.status).toBe(1);
  expect(productionAttempt.stderr).toContain('Public launch is blocked');
  expect(productionAttempt.stderr).toContain('Current service list');
});

test('modern logo images include explicit loading behavior', async ({ page }) => {
  await page.goto('/modern/');
  await expect(page.locator('.modern-brand img')).toHaveAttribute('decoding', 'async');
  await expect(page.locator('.modern-footer__logo-card img')).toHaveAttribute('loading', 'lazy');
  await expect(page.locator('.modern-footer__logo-card img')).toHaveAttribute('decoding', 'async');
});
