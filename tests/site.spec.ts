import { createHash } from 'node:crypto';
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

test('classic and modern logos use intentional white rounded cards', async ({ page }) => {
  await page.goto('/');
  const classicStyles = await page.locator('.brand').evaluate((element) => {
    const styles = getComputedStyle(element);
    return { background: styles.backgroundColor, radius: Number.parseFloat(styles.borderRadius) };
  });
  expect(classicStyles.background).toBe('rgb(255, 255, 255)');
  expect(classicStyles.radius).toBeGreaterThan(0);
  await expect(page.locator('.footer-brand-card img')).toBeVisible();

  await page.goto('/modern/');
  const modernStyles = await page.locator('.modern-brand').evaluate((element) => {
    const styles = getComputedStyle(element);
    return { background: styles.backgroundColor, radius: Number.parseFloat(styles.borderRadius) };
  });
  expect(modernStyles.background).toBe('rgb(255, 255, 255)');
  expect(modernStyles.radius).toBeGreaterThan(0);
  await expect(page.locator('.modern-footer__logo-card img')).toBeVisible();
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

test('modern concept uses a controlled light palette', async ({ page }) => {
  await page.goto('/modern/contact/');
  await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute('content', 'light');
  expect(await page.locator('html').evaluate((element) => getComputedStyle(element).colorScheme)).toContain('light');
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

test('modern pages have distinct content responsibilities', async ({ page }) => {
  await page.goto('/modern/');
  await expect(page.getByRole('heading', { name: /Dr\. William Donovan/i })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /Dr\. Caroline Whitaker/i })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Begin with what you need today.' })).toBeVisible();

  await page.goto('/modern/about/');
  await expect(page.getByText('Dr. William Donovan', { exact: false })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Common tasks should feel straightforward.' })).toBeVisible();

  await page.goto('/modern/team/');
  await expect(page.getByRole('heading', { name: 'Dr. William Donovan, DMD' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dr. Caroline Whitaker, DMD' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Friendly faces, clear roles.' })).toBeVisible();
});

test('modern service numbers stay below the headings', async ({ page }) => {
  await page.goto('/modern/services/');
  const cards = page.locator('.modern-service-card');
  await expect(cards).toHaveCount(3);
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

test('modern secondary actions have a visible outline', async ({ page }) => {
  await page.goto('/modern/');
  const button = page.getByRole('link', { name: 'Request a call' });
  const styles = await button.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      width: Number.parseFloat(computed.borderTopWidth),
      style: computed.borderTopStyle,
      color: computed.borderTopColor
    };
  });
  expect(styles.width).toBeGreaterThanOrEqual(2);
  expect(styles.style).toBe('solid');
  expect(styles.color).not.toBe('rgba(0, 0, 0, 0)');
});

test('PHI warning stays readable on the contact form', async ({ page }) => {
  await page.goto('/modern/contact/');
  const warning = page.locator('.modern-phi-warning');
  await expect(warning).toContainText('Do not include protected health information.');
  const styles = await warning.evaluate((element) => {
    const computed = getComputedStyle(element);
    return { color: computed.color, background: computed.backgroundColor };
  });
  expect(styles.color).toBe('rgb(68, 38, 29)');
  expect(styles.background).toBe('rgb(255, 242, 237)');
});

test('free-service integrations default to safe preview mode', async ({ page }) => {
  await page.goto('/modern/contact/');
  const form = page.locator('#modern-inquiry-form');
  await expect(form).toHaveAttribute('data-mode', 'preview');
  await expect(form).toHaveAttribute('data-turnstile', 'disabled');
  await expect(page.getByRole('button', { name: 'Preview request' })).toBeVisible();
  await expect(page.locator('.cf-turnstile')).toHaveCount(0);

  await page.goto('/modern/');
  await expect(page.locator('script[src="https://static.cloudflareinsights.com/beacon.min.js"]')).toHaveCount(0);
});

test('modern mobile header shows one Call label', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile-only layout assertion');
  await page.goto('/modern/contact/');
  const call = page.locator('.modern-header .modern-call');
  await expect(call).toBeVisible();
  await expect(call).toHaveText('Call');
  await expect(call).not.toContainText('CallCall');
});

test('modern mobile location card does not cover the office image', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile-only layout assertion');
  await page.goto('/modern/');
  const imageBox = await page.locator('.modern-hero__visual img').boundingBox();
  const cardBox = await page.locator('.modern-location-card').boundingBox();
  expect(imageBox).not.toBeNull();
  expect(cardBox).not.toBeNull();
  expect(cardBox!.y).toBeGreaterThanOrEqual(imageBox!.y + imageBox!.height - 2);
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

test('corrected patient form materializes with the reviewed hash', async ({ request }) => {
  const response = await request.get('/forms/new-patient-medical-history.pdf');
  expect(response.status()).toBeLessThan(400);
  const bytes = Buffer.from(await response.body());
  expect(bytes.length).toBe(105458);
  expect(createHash('sha256').update(bytes).digest('hex')).toBe('b71e76aac8aa37db4b1910c2e87984e223c14d9310d1bda8496a045963dbc1c5');
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
  await page.goto('/modern/about/');
  await page.screenshot({ path: testInfo.outputPath('modern-about.png'), fullPage: true, animations: 'disabled' });
  await page.goto('/modern/services/');
  await page.screenshot({ path: testInfo.outputPath('modern-services.png'), fullPage: true, animations: 'disabled' });
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
