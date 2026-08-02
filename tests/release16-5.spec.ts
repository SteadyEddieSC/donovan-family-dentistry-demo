import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('private review center is noindex, local-only, and absent from the sitemap', async ({ page, request }) => {
  await page.goto('/review/');

  await expect(page.locator('[data-review-center="local-only"]')).toBeVisible();
  await expect(page.locator('#device-review-form')).toHaveAttribute('data-mode', 'local-only');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow, noarchive');
  await expect(page.locator('.modern-mobile-dock')).toHaveCount(0);
  await expect(page.getByText('The page does not submit, store, email, or upload the report.')).toBeVisible();

  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).not.toContain('/review/');
});

test('preview footer exposes the device review helper without adding it to primary navigation', async ({ page }) => {
  await page.goto('/modern/');
  await expect(page.locator('.modern-footer').getByRole('link', { name: 'Review this device' })).toHaveAttribute('href', '/review/');
  await expect(page.locator('.modern-nav').getByRole('link', { name: 'Review this device' })).toHaveCount(0);
});

test('device environment is detected and a report is generated without a network submission', async ({ page }) => {
  await page.goto('/review/');

  await expect(page.locator('#review-detected-viewport')).not.toHaveText('Detecting…');
  await expect(page.locator('#review-detected-agent')).not.toHaveText('Detecting…');

  const writeRequests: string[] = [];
  page.on('request', (request) => {
    if (!['GET', 'HEAD'].includes(request.method())) writeRequests.push(`${request.method()} ${request.url()}`);
  });

  await page.getByLabel('Tester name or initials').fill('EG');
  await page.getByLabel('Device and operating system').fill('Galaxy S24 FE, Android 16');
  await page.getByLabel('Browser and version').fill('Chrome 151');
  await page.getByLabel('Overall result').selectOption('pass-with-notes');
  await page.getByLabel('Findings and notes').fill('Logo, footer, navigation, and PDFs reviewed in portrait and landscape.');

  const checks = page.locator('input[name="checks"]');
  await expect(checks).toHaveCount(8);
  for (let index = 0; index < await checks.count(); index += 1) await checks.nth(index).check();

  await page.getByRole('button', { name: 'Generate report' }).click();

  const report = page.locator('#review-report');
  await expect(report).toBeVisible();
  await expect(report).toContainText('Galaxy S24 FE, Android 16');
  await expect(report).toContainText('pass-with-notes');
  await expect(report).toContainText('generated locally in the browser');
  await expect(page.getByRole('status')).toHaveText('Report generated locally. Nothing was sent.');
  expect(writeRequests).toEqual([]);
});

test('review report can be downloaded as JSON', async ({ page }) => {
  await page.goto('/review/');
  await page.getByLabel('Device and operating system').fill('Windows 11 desktop');
  await page.getByLabel('Browser and version').fill('Microsoft Edge 151');
  await page.getByLabel('Overall result').selectOption('pass');

  const checks = page.locator('input[name="checks"]');
  for (let index = 0; index < await checks.count(); index += 1) await checks.nth(index).check();
  await page.getByRole('button', { name: 'Generate report' }).click();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download JSON' }).click()
  ]);
  expect(download.suggestedFilename()).toMatch(/^donovan-device-review-\d{4}-\d{2}-\d{2}\.json$/);
});

test('review center has no serious or critical automated accessibility violations', async ({ page }) => {
  await page.goto('/review/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
});

test('review center remains usable at a narrow physical-phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/review/');

  await expect(page.getByRole('heading', { name: 'Review this device without sending any data.' })).toBeVisible();
  await expect(page.getByLabel('Device and operating system')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Generate report' })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
