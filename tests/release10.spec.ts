import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const logoPairs = [
  { path: '/', wrapper: '.brand', image: '.brand img' },
  { path: '/', wrapper: '.footer-brand-card', image: '.footer-brand-card img' },
  { path: '/modern/', wrapper: '.modern-brand', image: '.modern-brand img' },
  { path: '/modern/', wrapper: '.modern-footer__logo-card', image: '.modern-footer__logo-card img' }
];

test('logo artwork is flush with its wrapper without a second card', async ({ page }) => {
  for (const item of logoPairs) {
    await page.goto(item.path);
    const wrapper = page.locator(item.wrapper);
    const image = page.locator(item.image);
    await expect(image).toBeVisible();

    const geometry = await wrapper.evaluate((element) => {
      const styles = getComputedStyle(element);
      const image = element.querySelector('img');
      const wrapperBox = element.getBoundingClientRect();
      const imageBox = image?.getBoundingClientRect();
      return {
        paddingTop: Number.parseFloat(styles.paddingTop),
        borderTop: Number.parseFloat(styles.borderTopWidth),
        shadow: styles.boxShadow,
        widthDifference: imageBox ? Math.abs(wrapperBox.width - imageBox.width) : 999,
        heightDifference: imageBox ? Math.abs(wrapperBox.height - imageBox.height) : 999
      };
    });

    expect(geometry.paddingTop).toBe(0);
    expect(geometry.borderTop).toBe(0);
    expect(geometry.shadow).toBe('none');
    expect(geometry.widthDifference).toBeLessThanOrEqual(1);
    expect(geometry.heightDifference).toBeLessThanOrEqual(1);
  }
});

test('new-patient guide is public-facing and accessible', async ({ page }) => {
  await page.goto('/modern/new-patients/');
  await expect(page.getByRole('heading', { name: 'A clear first step toward a comfortable visit.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'From first call to first visit.' })).toBeVisible();
  await expect(page.getByText('Coverage estimates are not guarantees of payment.')).toBeVisible();
  await expect(page.getByText('Call 911 or seek emergency care immediately', { exact: false })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download the patient form' })).toHaveAttribute('href', '/forms/new-patient-medical-history.pdf');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
});

test('new-patient route is linked and indexed in the demo sitemap', async ({ page, request }) => {
  await page.goto('/modern/');
  await expect(page.getByRole('link', { name: 'Read the new-patient guide' })).toHaveAttribute('href', '/modern/new-patients/');

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain('/modern/new-patients/');
});

test('new-patient mobile review screenshot', async ({ page, isMobile }, testInfo) => {
  test.skip(!isMobile, 'Mobile-only visual review');
  await page.goto('/modern/new-patients/');
  await page.screenshot({
    path: testInfo.outputPath('modern-new-patients-mobile.png'),
    fullPage: true,
    animations: 'disabled'
  });
});
