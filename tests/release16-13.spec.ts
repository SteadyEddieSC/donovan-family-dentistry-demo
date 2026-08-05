import { test, expect } from '@playwright/test';

for (const path of ['/about/', '/modern/team/']) {
  test(`${path} shows the owner-confirmed two-daughter profile detail`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });
    await expect(page.getByText('The couple has two daughters.', { exact: false })).toBeVisible();
    await expect(page.getByText('The couple has one daughter.', { exact: false })).toHaveCount(0);
  });
}

test('/about/ separates Dr. Donovan biography from Dr. Henke profile', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/about/', { waitUntil: 'networkidle' });

  const providers = page.locator('article.provider');
  await expect(providers).toHaveCount(2);

  const gap = await providers.evaluateAll((elements) => {
    const first = elements[0].getBoundingClientRect();
    const second = elements[1].getBoundingClientRect();
    return second.top - first.bottom;
  });

  expect(gap).toBeGreaterThanOrEqual(39);

  const geometry = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth
  }));
  expect(geometry.documentWidth).toBe(geometry.viewportWidth);

  await page.screenshot({
    path: testInfo.outputPath('release16-13-classic-provider-spacing.png'),
    fullPage: true
  });
});
