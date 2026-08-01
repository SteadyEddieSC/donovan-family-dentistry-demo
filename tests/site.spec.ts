import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const classicPages = ['/', '/about/', '/services/', '/forms/', '/contact/'];
const modernPages = ['/modern/', '/modern/about/', '/modern/services/', '/modern/team/', '/modern/forms/', '/modern/contact/'];
const pages = [...classicPages, ...modernPages];

for (const path of pages) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('main')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  });
}

test('classic primary actions work', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Call the office' })).toHaveAttribute('href', 'tel:+18435256866');
  await expect(page.getByRole('link', { name: 'Patient forms' }).first()).toHaveAttribute('href', '/forms/');
});

test('Dr. Donovan profile uses the approved photograph', async ({ page }) => {
  await page.goto('/about/');
  const photo = page.getByRole('img', { name: 'Dr. William Donovan with his family and dog outdoors.' });
  await expect(photo).toBeVisible();
  await expect(photo).toHaveAttribute('src', '/images/dr-william-donovan-family.webp');
  expect(await photo.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
});

test('directions button has visible text contrast', async ({ page }) => {
  await page.goto('/contact/');
  const button = page.getByRole('link', { name: 'Open directions' });
  await expect(button).toBeVisible();
  const styles = await button.evaluate((element) => {
    const computed = getComputedStyle(element);
    return { color: computed.color, backgroundColor: computed.backgroundColor };
  });
  expect(styles.color).not.toBe(styles.backgroundColor);
});

test('modern concept is self-contained', async ({ page }) => {
  await page.goto('/modern/');
  const headerLinks = await page.locator('.modern-header a[href^="/"]').evaluateAll((anchors) =>
    anchors.map((anchor) => (anchor as HTMLAnchorElement).getAttribute('href')).filter(Boolean)
  );
  expect(headerLinks.every((href) => href?.startsWith('/modern/'))).toBeTruthy();
  await expect(page.getByRole('link', { name: 'Patient forms' }).first()).toHaveAttribute('href', '/modern/forms/');
  await expect(page.getByRole('link', { name: 'Request a call' })).toHaveAttribute('href', '/modern/contact/');
});

test('modern hero preserves the full office image and footer logo is visible', async ({ page }) => {
  await page.goto('/modern/');
  const hero = page.locator('.modern-hero__visual img');
  await expect(hero).toBeVisible();
  expect(await hero.evaluate((image) => getComputedStyle(image).objectFit)).toBe('contain');
  const footerLogo = page.locator('.modern-footer__logo-card img');
  await expect(footerLogo).toBeVisible();
  expect(await footerLogo.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
});

test('modern service numbers stay below the headings', async ({ page }) => {
  await page.goto('/modern/');
  const cards = page.locator('.modern-service-card');
  for (let index = 0; index < await cards.count(); index += 1) {
    const metrics = await cards.nth(index).evaluate((element) => {
      const cardRect = element.getBoundingClientRect();
      const headingRect = element.querySelector('h3')?.getBoundingClientRect();
      const pseudo = getComputedStyle(element, '::before');
      return {
        pseudoTop: cardRect.top + Number.parseFloat(pseudo.top),
        headingBottom: headingRect?.bottom ?? cardRect.top,
        bottom: pseudo.bottom
      };
    });
    expect(metrics.bottom).not.toBe('auto');
    expect(metrics.pseudoTop).toBeGreaterThan(metrics.headingBottom + 20);
  }
});

test('modern inquiry preview validates locally and sends nothing', async ({ page }) => {
  await page.goto('/modern/contact/');
  await page.getByLabel('Name').fill('Alex Patient');
  await page.getByLabel('Phone').fill('(843) 555-0100');
  await page.getByLabel('Administrative message').fill('I would like a call about scheduling a new-patient visit.');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Preview request' }).click();
  const result = page.getByRole('status');
  await expect(result).toContainText('Preview complete - nothing was sent');
  await expect(result).toContainText('(843) 555-0100');
});

test('internal links and downloadable assets resolve', async ({ page, request }) => {
  const internalLinks = new Set<string>();
  for (const path of pages) {
    await page.goto(path);
    const links = await page.locator('a[href^="/"]').evaluateAll((anchors) =>
      anchors.map((anchor) => (anchor as HTMLAnchorElement).getAttribute('href')).filter((href): href is string => Boolean(href))
    );
    links.forEach((href) => internalLinks.add(href));
  }
  internalLinks.add('/images/dr-william-donovan-family.webp');
  internalLinks.add('/forms/new-patient-medical-history.pdf');
  internalLinks.add('/forms/privacy-practices.pdf');
  internalLinks.add('/sitemap.xml');
  internalLinks.add('/robots.txt');
  for (const href of internalLinks) {
    const response = await request.get(href);
    expect(response.status(), `${href} should resolve`).toBeLessThan(400);
  }
});

test('classic homepage review screenshot', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.screenshot({ path: testInfo.outputPath('classic-homepage.png'), fullPage: true, animations: 'disabled' });
});

test('modern concept review screenshots', async ({ page }, testInfo) => {
  await page.goto('/modern/');
  await page.screenshot({ path: testInfo.outputPath('modern-homepage.png'), fullPage: true, animations: 'disabled' });
  await page.goto('/modern/team/');
  await page.screenshot({ path: testInfo.outputPath('modern-team.png'), fullPage: true, animations: 'disabled' });
  await page.goto('/modern/contact/');
  await page.screenshot({ path: testInfo.outputPath('modern-contact.png'), fullPage: true, animations: 'disabled' });
});

test('classic mobile navigation opens and closes', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile-only behavior');
  await page.goto('/');
  const header = page.getByRole('banner');
  const button = header.getByRole('button', { name: 'Menu' });
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(header.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
});
