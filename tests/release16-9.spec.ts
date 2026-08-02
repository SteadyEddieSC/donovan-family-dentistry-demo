import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('calm communication stays together on the reviewed phone width without widening the page', async ({ page }) => {
  await page.setViewportSize({ width: 384, height: 832 });
  await page.goto('/modern/about/');

  const heading = page.getByRole('heading', {
    name: 'Useful information, calm communication, and a clear next step.'
  });
  const phrase = page.locator('.modern-values-title__phrase');
  await expect(heading).toBeVisible();
  await expect(phrase).toHaveText('calm communication');

  const layout = await page.evaluate(() => {
    const heading = document.querySelector('.modern-values-title')!;
    const phrase = document.querySelector('.modern-values-title__phrase')!;
    const headingRect = heading.getBoundingClientRect();
    const phraseRect = phrase.getBoundingClientRect();
    const phraseStyle = getComputedStyle(phrase);
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      phraseRight: phraseRect.right,
      headingRight: headingRect.right,
      phraseHeight: phraseRect.height,
      lineHeight: Number.parseFloat(phraseStyle.lineHeight)
    };
  });

  expect(layout.scrollWidth).toBe(layout.clientWidth);
  expect(layout.phraseRight).toBeLessThanOrEqual(layout.headingRight + 1);
  expect(layout.phraseHeight).toBeLessThanOrEqual(layout.lineHeight + 1);
  await page.screenshot({ path: 'test-results/release16-10-about-mobile.png', fullPage: true });
});

test('About, Team, and Services use patient-facing language instead of project notes', async ({ page }) => {
  await page.goto('/modern/about/');
  await expect(page.getByText(/Dr\. Donovan's path through dental laboratory work/)).toBeVisible();
  await expect(page.getByText(/without repeating the full dentist biography/i)).toHaveCount(0);

  await page.goto('/modern/team/');
  await expect(page.getByText(/help each visit feel organized, informed, and welcoming/i)).toBeVisible();
  await expect(page.getByText(/office editor|Role-based profiles keep the page useful now/i)).toHaveCount(0);

  await page.goto('/modern/services/');
  await expect(page.getByText(/published procedures in patient-friendly groups/i)).toBeVisible();
  await expect(page.getByText(/subject to office confirmation/i)).toHaveCount(0);
});

test('Release 16.9 About page reflows and has no serious or critical axe findings', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/modern/about/');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
});
