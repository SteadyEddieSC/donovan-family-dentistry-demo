import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('reviewed Galaxy-width About page does not overflow and keeps the phrase inside the heading', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 384, height: 832 });
  await page.goto('/modern/about/');

  const phrase = page.locator('.modern-values-title__phrase');
  await expect(phrase).toHaveText('calm communication');

  const geometry = await page.evaluate(() => {
    const heading = document.querySelector('.modern-values-title')!.getBoundingClientRect();
    const phrase = document.querySelector('.modern-values-title__phrase')!.getBoundingClientRect();
    return {
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      headingLeft: heading.left,
      headingRight: heading.right,
      phraseLeft: phrase.left,
      phraseRight: phrase.right
    };
  });

  expect(geometry.documentWidth).toBe(geometry.viewportWidth);
  expect(geometry.phraseLeft).toBeGreaterThanOrEqual(geometry.headingLeft - 1);
  expect(geometry.phraseRight).toBeLessThanOrEqual(geometry.headingRight + 1);
  await page.screenshot({ path: testInfo.outputPath('release16-10-about-galaxy-width.png'), fullPage: true });
});

test('large contact-card surfaces use the lighter brand tint while compact accents retain logo green', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 384, height: 832 });
  await page.goto('/modern/contact/');

  const featured = page.locator('.modern-contact-tile--featured');
  await expect(featured).toBeVisible();
  expect(await featured.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe('rgb(139, 184, 79)');
  await page.screenshot({ path: testInfo.outputPath('release16-10-contact-green.png'), fullPage: true });

  await page.goto('/modern/about/');
  const compactAccent = page.locator('.modern-value-icon').first();
  expect(await compactAccent.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe('rgb(114, 169, 40)');
});

test('Release 16.10 reviewed pages have no serious or critical automated accessibility findings', async ({ page }) => {
  for (const path of ['/modern/about/', '/modern/contact/', '/modern/new-patients/']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
});
