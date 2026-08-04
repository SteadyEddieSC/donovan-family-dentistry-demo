import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const donovanAlt = 'Dr. William Donovan standing with three family members in a historic outdoor courtyard.';
const henkeAlt = 'Dr. Jordan Henke with his wife, Mia, and their four children outdoors.';

for (const concept of [
  { name: 'classic About', path: '/about/' },
  { name: 'modern Team', path: '/modern/team/' }
]) {
  test(`${concept.name} publishes both approved dentists and supplied family photographs`, async ({ page }, testInfo) => {
    await page.goto(concept.path);

    await expect(page.getByRole('heading', { name: 'Dr. William Donovan, DMD' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dr. Jordan Henke, DDS' })).toBeVisible();
    await expect(page.getByText('Henke Family', { exact: true })).toBeVisible();
    await expect(page.getByText(/Koolkin/i)).toHaveCount(0);

    const donovanImage = page.getByRole('img', { name: donovanAlt });
    await expect(donovanImage).toHaveAttribute('src', '/images/dr-william-donovan-family.webp');
    await expect(donovanImage).toHaveAttribute('srcset', /dr-william-donovan-family-360\.webp 360w[\s\S]*480w/);
    expect(await donovanImage.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThanOrEqual(360);

    const henkeImage = page.getByRole('img', { name: henkeAlt });
    await expect(henkeImage).toHaveAttribute('src', '/images/dr-jordan-henke-family.webp');
    await expect(henkeImage).toHaveAttribute('srcset', /dr-jordan-henke-family-360\.webp 360w[\s\S]*480w/);
    expect(await henkeImage.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThanOrEqual(360);

    await page.screenshot({
      path: testInfo.outputPath(`release16-11-${concept.path.includes('modern') ? 'modern-team' : 'classic-about'}.png`),
      fullPage: true,
      animations: 'disabled'
    });
  });
}

test('provider pages reflow on the reviewed Galaxy width', async ({ page }) => {
  await page.setViewportSize({ width: 384, height: 832 });

  for (const path of ['/about/', '/modern/team/']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: 'Dr. William Donovan, DMD' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dr. Jordan Henke, DDS' })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
});

test('provider responsive image assets resolve', async ({ request }) => {
  for (const path of [
    '/images/dr-william-donovan-family.webp',
    '/images/dr-william-donovan-family-360.webp',
    '/images/dr-jordan-henke-family.webp',
    '/images/dr-jordan-henke-family-360.webp'
  ]) {
    const response = await request.get(path);
    expect(response.status(), `${path} should resolve`).toBeLessThan(400);
    expect(Number(response.headers()['content-length'] ?? 0)).toBeGreaterThan(5_000);
  }
});
