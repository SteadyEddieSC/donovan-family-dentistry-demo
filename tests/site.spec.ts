import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = ['/', '/about/', '/services/', '/forms/', '/contact/'];

for (const path of pages) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('main')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  });
}

test('primary actions work', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Call the office' })).toHaveAttribute('href', 'tel:+18435256866');
  await expect(page.getByRole('link', { name: 'Patient forms' }).first()).toHaveAttribute('href', '/forms/');
});

test('Dr. Donovan profile uses the approved photograph', async ({ page }) => {
  await page.goto('/about/');
  const photo = page.getByRole('img', { name: 'Dr. William Donovan with his family and dog outdoors.' });
  await expect(photo).toBeVisible();
  await expect(photo).toHaveAttribute('src', '/images/dr-william-donovan-family.webp');
  expect(await photo.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
});

test('directions button has visible text contrast', async ({ page }) => {
  await page.goto('/contact/');
  const button = page.getByRole('link', { name: 'Open directions' });
  await expect(button).toBeVisible();
  const styles = await button.evaluate((element) => {
    const computed = getComputedStyle(element);
    return { color: computed.color, backgroundColor: computed.backgroundColor };
  });
  expect(styles.color).not.toBe(styles.backgroundColor);
});

test('internal links and downloadable forms resolve', async ({ page, request }) => {
  const internalLinks = new Set<string>();

  for (const path of pages) {
    await page.goto(path);
    const links = await page.locator('a[href^="/"]').evaluateAll((anchors) =>
      anchors.map((anchor) => (anchor as HTMLAnchorElement).getAttribute('href')).filter((href): href is string => Boolean(href))
    );
    links.forEach((href) => internalLinks.add(href));
  }

  internalLinks.add('/images/dr-william-donovan-family.webp');
  internalLinks.add('/forms/new-patient-medical-history.pdf');
  internalLinks.add('/forms/privacy-practices.pdf');
  internalLinks.add('/sitemap.xml');
  internalLinks.add('/robots.txt');

  for (const href of internalLinks) {
    const response = await request.get(href);
    expect(response.status(), `${href} should resolve`).toBeLessThan(400);
  }
});

test('homepage review screenshot', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.screenshot({
    path: testInfo.outputPath('homepage.png'),
    fullPage: true,
    animations: 'disabled'
  });
});

test('mobile navigation opens and closes', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile-only behavior');
  await page.goto('/');
  const header = page.getByRole('banner');
  const button = header.getByRole('button', { name: 'Menu' });
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(header.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
});
