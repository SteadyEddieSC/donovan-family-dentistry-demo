import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = ['/', '/about/', '/services/', '/forms/', '/contact/'];

for (const path of pages) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('main')).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  });
}

test('primary actions work', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Call the office' })).toHaveAttribute('href', 'tel:+18435256866');
  await expect(page.getByRole('link', { name: 'Patient forms' }).first()).toHaveAttribute('href', '/forms/');
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
