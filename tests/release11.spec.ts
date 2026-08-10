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
    expect(dentist.email).toBe('dfdbeaufort@gmail.com');
    expect(dentist.address.streetAddress).toBe('91 Sams Point Road');
    expect(dentist.openingHoursSpecification[0].opens).toBe('07:30');
    expect(dentist.openingHoursSpecification[0].closes).toBe('17:00');

    const webPage = graph.find((item) => item['@type'] === 'WebPage');
    expect(webPage).toBeTruthy();
    expect(webPage.url).toBe(canonical);
    expect(webPage.name).toBe(title);
  });
}

test('web manifest is valid and points to the approved Classic patient experience', async ({ request }) => {
  const response = await request.get('/site.webmanifest');
  expect(response.status()).toBe(200);
  const manifest = JSON.parse(await response.text());
  expect(manifest.name).toBe('Donovan Family Dentistry');
  expect(manifest.start_url).toBe('/');
  expect(manifest.scope).toBe('/');
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons[0].src).toBe('/favicon.svg');
});

test('content verification register separates approved Classic evidence from deferred Modern follow-ups', async ({ isMobile }) => {
  test.skip(isMobile, 'Repository-level validation only needs to run once.');
  const register = JSON.parse(
    readFileSync(path.join(repositoryRoot, 'src/data/content-status.json'), 'utf8')
  );
  const verifiedIds = register.verified.map((item: { id: string }) => item.id);
  const blockerIds = register.launchBlockers.map((item: { id: string }) => item.id);
  const followUpIds = register.editorialFollowUps.map((item: { id: string }) => item.id);

  expect(new Set(verifiedIds).size).toBe(verifiedIds.length);
  expect(new Set(blockerIds).size).toBe(blockerIds.length);
  expect(new Set(followUpIds).size).toBe(followUpIds.length);

  expect(verifiedIds).toContain('provider-roster');
  expect(verifiedIds).toContain('dr-donovan-profile');
  expect(verifiedIds).toContain('dr-henke-profile');
  expect(verifiedIds).toContain('classic-content-approval');
  expect(verifiedIds).toContain('insurance-network-status');
  expect(verifiedIds).toContain('administrative-inquiry-deferred');
  expect(blockerIds).toHaveLength(0);
  expect(followUpIds).toContain('modern-page-wording');
  expect(followUpIds).toContain('modern-administrative-inquiry');
  expect(followUpIds).toContain('staff-roster');
});

test('Release 15 gate keeps infrastructure evidence fail-closed even after Classic content approval', async ({ isMobile }) => {
  test.skip(isMobile, 'Repository-level validation only needs to run once.');

  const readiness = spawnSync(process.execPath, ['scripts/check-release15-readiness.mjs'], {
    cwd: repositoryRoot,
    encoding: 'utf8'
  });
  expect(readiness.status).toBe(0);
  expect(readiness.stdout).toContain('readiness phase');

  const productionAttempt = spawnSync(process.execPath, ['scripts/check-release15-readiness.mjs'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      LAUNCH_PHASE: 'production',
      LAUNCH_PREVIEW_MODE: 'false'
    }
  });
  expect(productionAttempt.status).toBe(1);
  expect(productionAttempt.stderr).toContain('Production launch is blocked');
  expect(productionAttempt.stderr).toMatch(/physical-device-review|human-wcag-review|dns-zone-backup/);
});

test('modern logo images include explicit loading behavior', async ({ page }) => {
  await page.goto('/modern/');
  await expect(page.locator('.modern-brand img')).toHaveAttribute('decoding', 'async');
  await expect(page.locator('.modern-footer__logo-card img')).toHaveAttribute('loading', 'lazy');
  await expect(page.locator('.modern-footer__logo-card img')).toHaveAttribute('decoding', 'async');
});
