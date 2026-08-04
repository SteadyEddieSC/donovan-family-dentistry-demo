import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const henkeAlt = 'Dr. Jordan Henke with his wife, Mia, and their four children outdoors.';

test('classic About publishes both approved dentists and the Henke family image', async ({ page }, testInfo) => {
  await page.goto('/about/');

  await expect(page.getByRole('heading', { name: 'Dr. William Donovan, DMD' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dr. Jordan Henke, DDS' })).toBeVisible();
  await expect(page.getByText('Henke Family', { exact: true })).toBeVisible();
  await expect(page.getByText(/Koolkin/i)).toHaveCount(0);

  const image = page.getByRole('img', { name: henkeAlt });
  await expect(image).toHaveAttribute('src', '/images/dr-jordan-henke-family.webp');
  await expect(image).toHaveAttribute('srcset', /dr-jordan-henke-family-480\.webp 480w/);
  expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThanOrEqual(900);

  await page.screenshot({ path: testInfo.outputPath('release16-11-classic-about.png'), fullPage: true, animations: 'disabled' });
});

test('modern Team publishes both approved dentists and the Henke family image', async ({ page }, testInfo) => {
  await page.goto('/modern/team/');

  await expect(page.getByRole('heading', { name: 'Dr. William Donovan, DMD' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dr. Jordan Henke, DDS' })).toBeVisible();
  await expect(page.getByText('Henke Family', { exact: true })).toBeVisible();
  await expect(page.getByText(/Koolkin/i)).toHaveCount(0);

  const image = page.getByRole('img', { name: henkeAlt });
  await expect(image).toHaveAttribute('src', '/images/dr-jordan-henke-family.webp');
  expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThanOrEqual(900);

  await page.screenshot({ path: testInfo.outputPath('release16-11-modern-team.png'), fullPage: true, animations: 'disabled' });
});

test('Henke provider pages reflow on the reviewed Galaxy width', async ({ page }) => {
  await page.setViewportSize({ width: 384, height: 832 });

  for (const path of ['/about/', '/modern/team/']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: 'Dr. Jordan Henke, DDS' })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
});

test('Henke responsive image assets resolve', async ({ request }) => {
  for (const path of ['/images/dr-jordan-henke-family.webp', '/images/dr-jordan-henke-family-480.webp']) {
    const response = await request.get(path);
    expect(response.status(), `${path} should resolve`).toBeLessThan(400);
    expect(Number(response.headers()['content-length'] ?? 0)).toBeGreaterThan(10_000);
  }
});
