import { test, expect } from '@playwright/test';

test('modern logo wrappers do not clip the SVG or create a second card', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/modern/');

  const selectors = ['.modern-brand', '.modern-footer__logo-card'];
  for (const selector of selectors) {
    const wrapper = page.locator(selector);
    await wrapper.scrollIntoViewIfNeeded();
    await expect(wrapper).toBeVisible();

    const metrics = await wrapper.evaluate((element) => {
      const image = element.querySelector('img') as HTMLImageElement | null;
      const wrapperStyles = getComputedStyle(element);
      const imageStyles = image ? getComputedStyle(image) : null;
      const wrapperRect = element.getBoundingClientRect();
      const imageRect = image?.getBoundingClientRect();
      return {
        wrapperBackground: wrapperStyles.backgroundColor,
        wrapperRadius: wrapperStyles.borderRadius,
        wrapperOverflow: wrapperStyles.overflow,
        wrapperPadding: Number.parseFloat(wrapperStyles.paddingTop),
        imageBackground: imageStyles?.backgroundColor ?? '',
        imageRadius: imageStyles?.borderRadius ?? '',
        imageFilter: imageStyles?.filter ?? '',
        widthDifference: imageRect ? Math.abs(wrapperRect.width - imageRect.width) : 999,
        heightDifference: imageRect ? Math.abs(wrapperRect.height - imageRect.height) : 999
      };
    });

    expect(metrics.wrapperBackground).toBe('rgba(0, 0, 0, 0)');
    expect(metrics.wrapperRadius).toBe('0px');
    expect(metrics.wrapperOverflow).toBe('visible');
    expect(metrics.wrapperPadding).toBe(0);
    expect(metrics.imageBackground).toBe('rgba(0, 0, 0, 0)');
    expect(metrics.imageRadius).toBe('0px');
    expect(metrics.imageFilter).toBe('none');
    expect(metrics.widthDifference).toBeLessThanOrEqual(1);
    expect(metrics.heightDifference).toBeLessThanOrEqual(1);
  }
});

test('the office vCard is downloadable and contains only public office data', async ({ page, request }) => {
  await page.goto('/modern/contact/');
  const link = page.getByRole('link', { name: 'Save office contact' }).first();
  await expect(link).toHaveAttribute('href', '/donovan-family-dentistry.vcf');
  await expect(link).toHaveAttribute('download', '');

  const response = await request.get('/donovan-family-dentistry.vcf');
  expect(response.status()).toBeLessThan(400);
  const card = await response.text();
  expect(card).toContain('BEGIN:VCARD');
  expect(card).toContain('VERSION:3.0');
  expect(card).toContain('FN:Donovan Family Dentistry');
  expect(card).toContain('TEL;TYPE=WORK,VOICE:+18435256866');
  expect(card).toContain('91 Sams Point Road;Beaufort;SC;29907;USA');
  expect(card).not.toMatch(/patient|diagnos|insurance id|social security/i);
});

test('the not-found page uses the modern recovery path', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'That page is not here.' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Return home/ })).toHaveAttribute('href', '/modern/');
  await expect(page.getByRole('link', { name: /Call the office/ })).toHaveAttribute('href', 'tel:+18435256866');
  await expect(page.getByRole('link', { name: /Open directions/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Patient forms/ })).toHaveAttribute('href', '/modern/forms/');
});
