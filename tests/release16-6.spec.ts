import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('downloadable contact card is the first and visually distinct contact action', async ({ page }) => {
  await page.goto('/modern/contact/');

  const actions = page.locator('.modern-contact-stack > a');
  await expect(actions).toHaveCount(4);
  await expect(actions.nth(0)).toContainText('Downloadable Contact Card');
  await expect(actions.nth(0)).toContainText('open the file to import it');
  await expect(actions.nth(0)).toHaveClass(/modern-contact-tile--featured/);
  await expect(actions.nth(0)).toHaveAttribute('href', '/donovan-family-dentistry.vcf');
  await expect(actions.nth(0)).toHaveAttribute('download', '');
  await expect(actions.nth(1)).toContainText('Call the office');
  await expect(actions.nth(2)).toContainText('Open directions');
  await expect(actions.nth(3)).toContainText('Patient forms');

  const featuredColors = await actions.nth(0).evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, color: style.color };
  });
  expect(featuredColors.background).toBe('rgb(139, 184, 79)');
  expect(featuredColors.color).toBe('rgb(6, 47, 53)');

  await expect(page.locator('.modern-contact-stack .modern-action-icon')).toHaveCount(4);
  await expect(page.locator('.modern-contact-stack .modern-action-icon').first()).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.modern-page-hero__aside')).toContainText('After it downloads, open the file once to import the office into your contacts.');
});

test('New Patients exposes the same downloadable contact card near the top of the journey', async ({ page }) => {
  await page.goto('/modern/new-patients/');

  const saveContact = page.getByRole('link', { name: /Downloadable Contact Card/ });
  await expect(saveContact).toBeVisible();
  await expect(saveContact).toHaveAttribute('href', '/donovan-family-dentistry.vcf');
  await expect(saveContact).toHaveAttribute('download', '');

  const colors = await saveContact.evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, color: style.color };
  });
  expect(colors.background).toBe('rgb(139, 184, 79)');
  expect(colors.color).toBe('rgb(16, 47, 51)');

  const startHeading = page.getByRole('heading', { name: 'From first call to first visit.' });
  await expect(startHeading).toBeVisible();
  expect(await saveContact.evaluate((element) => Boolean(element.compareDocumentPosition(document.querySelector('.modern-onboarding-grid')) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
});

test('compact brand-green accents retain the exact logo green', async ({ page }) => {
  await page.goto('/modern/about/');

  const valueIcon = page.locator('.modern-value-icon').first();
  await expect(valueIcon).toBeVisible();
  expect(await valueIcon.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe('rgb(114, 169, 40)');

  const kickerRule = await page.locator('.modern-kicker').first().evaluate((element) => getComputedStyle(element, '::before').backgroundColor);
  expect(kickerRule).toBe('rgb(114, 169, 40)');
});

test('contact and New Patients action surfaces remain usable on a narrow phone', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });

  for (const path of ['/modern/contact/', '/modern/new-patients/']) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }

  await expect(page.getByRole('link', { name: /Downloadable Contact Card/ })).toBeVisible();
});

test('Release 16.7 action surfaces have no serious or critical automated accessibility violations', async ({ page }) => {
  for (const path of ['/modern/contact/', '/modern/new-patients/', '/modern/about/']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  }
});
