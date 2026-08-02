import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('private Open Dental readiness page stays noindex, local, and out of patient navigation', async ({ page }) => {
  await page.goto('/review/open-dental/');

  await expect(page.getByRole('heading', { name: 'Use Open Dental first—without duplicating the practice system.' })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i);
  await expect(page.locator('.modern-mobile-dock')).toHaveCount(0);
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.locator('form')).toHaveCount(0);
  await expect(page.getByText('No patient-system link is active yet.')).toBeVisible();

  const patientNav = page.locator('.modern-nav');
  await expect(patientNav.getByRole('link', { name: /Open Dental/i })).toHaveCount(0);
});

test('Open Dental references open directly and safely', async ({ page }) => {
  await page.goto('/review/open-dental/');

  const webForms = page.getByRole('link', { name: 'Web Forms feature' });
  await expect(webForms).toHaveAttribute('href', 'https://www.opendental.com/site/webforms.html');
  await expect(webForms).toHaveAttribute('target', '_blank');
  await expect(webForms).toHaveAttribute('rel', /noopener/);

  const apiSetup = page.getByRole('link', { name: 'API setup and third-party access' });
  await expect(apiSetup).toHaveAttribute('href', 'https://www.opendental.com/manual/fhir.html');
  await expect(apiSetup).toHaveAttribute('target', '_blank');
  await expect(apiSetup).toHaveAttribute('rel', /noopener/);
});

test('announcement remains hidden until the office enables it and does not duplicate', async ({ page }) => {
  for (const path of ['/', '/about/', '/modern/', '/modern/about/']) {
    await page.goto(path);
    await expect(page.locator('.office-announcement')).toHaveCount(0);
  }
});

test('Release 16.8 pages reflow and have no serious or critical axe findings', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });

  for (const path of ['/review/open-dental/', '/modern/', '/']) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
});
