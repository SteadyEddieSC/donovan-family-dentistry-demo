import { test, expect } from '@playwright/test';

const previewOrigin = 'https://donovan-family-dentistry-demo.pages.dev';
const productionOrigin = 'https://www.donovanfamilydentistry.com';
const publicRoutes = ['/', '/about/', '/services/', '/new-patients/', '/forms/', '/contact/', '/accessibility/', '/website-use/'];

test.describe('Release 17.1 Classic SEO contracts', () => {
  for (const route of publicRoutes) {
    test(`${route} has one complete preview-safe metadata set`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'networkidle' });
      await expect(page.locator('title')).toHaveCount(1);
      await expect(page.locator('meta[name="description"]')).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow, noarchive');
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${previewOrigin}${route}`);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `${previewOrigin}${route}`);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `${previewOrigin}/images/donovan-social-card.webp`);
      await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
      await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
      await expect(page.locator('meta[property="og:image:alt"]')).not.toHaveAttribute('content', '');
    });
  }

  test('public titles and descriptions are unique', async ({ browser }) => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const route of publicRoutes) {
      const page = await browser.newPage();
      await page.goto(`http://127.0.0.1:4321${route}`);
      const title = await page.title();
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(titles.has(title), `duplicate title on ${route}`).toBeFalsy();
      expect(descriptions.has(description ?? ''), `duplicate description on ${route}`).toBeFalsy();
      titles.add(title);
      descriptions.add(description ?? '');
      await page.close();
    }
  });

  test('sitemap contains Classic public routes only and maps cleanly to production readiness', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    const urls = [...body.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
    expect(urls).toHaveLength(publicRoutes.length);
    for (const route of publicRoutes) {
      expect(urls).toContain(`${previewOrigin}${route}`);
      expect(new URL(route, productionOrigin).origin).toBe(productionOrigin);
    }
    expect(body).not.toContain('/modern/');
    expect(body).not.toContain('/review/');
    expect(body).not.toContain('/404-review-example');
  });

  test('Classic emits one authoritative Dentist entity and retained noindex pages emit none', async ({ page }) => {
    await page.goto('/contact/');
    const scripts = page.locator('script[type="application/ld+json"]');
    await expect(scripts).toHaveCount(1);
    const data = JSON.parse(await scripts.textContent() ?? '{}');
    const graph: any[] = data['@graph'];
    expect(graph.filter((node) => node['@type'] === 'Dentist')).toHaveLength(1);
    const dentist = graph.find((node) => node['@type'] === 'Dentist');
    expect(dentist.name).toBe('Donovan Family Dentistry');
    expect(dentist.telephone).toBe('+18435256866');
    expect(dentist.address.streetAddress).toBe('91 Sams Point Road');
    expect(dentist.logo.url).toBe(`${previewOrigin}/images/donovan-logo.svg`);
    expect(dentist.openingHoursSpecification[0].opens).toBe('08:00');
    expect(dentist.openingHoursSpecification[0].closes).toBe('17:00');

    for (const route of ['/modern/', '/modern/contact/', '/review/']) {
      await page.goto(route);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
      await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
    }
  });

  test('new-patient page is reachable, accessible, and visually reviewable', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'New-patient information' })).toHaveAttribute('href', '/new-patients/');
    await page.goto('/new-patients/', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { level: 1, name: 'Prepare for your first visit' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Download the patient form' })).toHaveAttribute('href', '/forms/new-patient-medical-history.pdf');
    await page.screenshot({ path: testInfo.outputPath('release17-1-classic-new-patients.png'), fullPage: true, animations: 'disabled' });
  });
});
