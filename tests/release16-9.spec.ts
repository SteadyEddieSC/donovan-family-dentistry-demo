import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('calm communication stays together on the reviewed phone width', async ({ page }) => {
  await page.setViewportSize({ width: 384, height: 832 });
  await page.goto('/modern/about/');

  const heading = page.getByRole('heading', {
    name: 'Useful information, calm communication, and a clear next step.'
  });
  await expect(heading).toBeVisible();

  const phraseLayout = await heading.evaluate((element) => {
    const target = 'calm\u00a0communication';
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const text = node.textContent ?? '';
      const index = text.indexOf(target);
      if (index >= 0) {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + target.length);
        const rects = [...range.getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0);
        return {
          rectCount: rects.length,
          lineTops: [...new Set(rects.map((rect) => Math.round(rect.top)))]
        };
      }
      node = walker.nextNode();
    }
    return { rectCount: 0, lineTops: [] };
  });

  expect(phraseLayout.rectCount).toBeGreaterThan(0);
  expect(phraseLayout.lineTops).toHaveLength(1);
  await expect(page.locator('html')).toHaveJSProperty('scrollWidth', 384);
  await page.screenshot({ path: 'test-results/release16-9-about-mobile.png', fullPage: true });
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
