import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const path of ['/about/', '/modern/team/']) {
  test(`${path} publishes both approved dentists and local photos`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 384, height: 832 });
    await page.goto(path);

    await expect(page.getByRole('heading', { name: /Dr\. William Donovan, DMD/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Dr\. Jordan Henke, DDS/i })).toBeVisible();
    await expect(page.getByText('Henke Family', { exact: true })).toBeVisible();
    await expect(page.getByText(/Koolkin/i)).toHaveCount(0);

    const images = page.locator('img[src*="dr-william-donovan-photo"], img[src*="dr-jordan-henke-family"]');
    await expect(images).toHaveCount(2);
    for (let index = 0; index < 2; index += 1) {
      expect(await images.nth(index).evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    }

    const geometry = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth
    }));
    expect(geometry.documentWidth).toBe(geometry.viewportWidth);

    await page.screenshot({ path: testInfo.outputPath(`release16-11-${path.includes('modern') ? 'modern-team' : 'classic-about'}.png`), fullPage: true });
  });
}

test('Release 16.11 provider pages have no serious or critical automated accessibility findings', async ({ page }) => {
  for (const path of ['/about/', '/modern/team/']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
});
