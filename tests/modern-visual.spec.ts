import { test, expect } from '@playwright/test';

test('team privacy card remains readable in the dark section', async ({ page }) => {
  await page.goto('/modern/team/');
  const card = page.locator('.modern-section--deep .modern-visit-card');
  await expect(card.getByRole('heading', { name: 'Privacy reminder' })).toBeVisible();
  await expect(card).toContainText('Do not send symptoms');
  const colors = await card.evaluate((element) => {
    const cardStyles = getComputedStyle(element);
    const heading = element.querySelector('h3');
    const paragraph = element.querySelector('p');
    return {
      background: cardStyles.backgroundColor,
      heading: heading ? getComputedStyle(heading).color : '',
      paragraph: paragraph ? getComputedStyle(paragraph).color : ''
    };
  });
  expect(colors.heading).not.toBe(colors.background);
  expect(colors.paragraph).not.toBe(colors.background);
});

test('modern dark preference keeps cards, buttons, and the shared logo readable', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/modern/');

  const logoCard = page.locator('.modern-brand');
  const logoImage = logoCard.locator('img');
  const requestButton = page.getByRole('link', { name: 'Request a call' });
  const pathCard = page.locator('.modern-path-card').first();

  const colors = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const logo = getComputedStyle(document.querySelector('.modern-brand')!);
    const logoImage = getComputedStyle(document.querySelector('.modern-brand img')!);
    const button = getComputedStyle(Array.from(document.querySelectorAll('a')).find((item) => item.textContent?.trim() === 'Request a call')!);
    const card = getComputedStyle(document.querySelector('.modern-path-card')!);
    return {
      bodyBackground: body.backgroundColor,
      bodyColor: body.color,
      logoBackground: logo.backgroundColor,
      logoImageBackground: logoImage.backgroundColor,
      logoFilter: logoImage.filter,
      buttonColor: button.color,
      buttonBorder: button.borderTopColor,
      cardBackground: card.backgroundColor,
      cardColor: card.color
    };
  });

  await expect(logoCard).toBeVisible();
  await expect(logoImage).toBeVisible();
  await expect(logoImage).toHaveAttribute('src', '/images/donovan-logo.svg');
  await expect(requestButton).toBeVisible();
  await expect(pathCard).toBeVisible();
  expect(colors.bodyBackground).not.toBe(colors.bodyColor);
  expect(colors.logoBackground).toBe('rgb(255, 255, 255)');
  expect(colors.logoImageBackground).toBe('rgb(255, 255, 255)');
  expect(colors.logoFilter).toBe('none');
  expect(colors.buttonColor).not.toBe(colors.bodyBackground);
  expect(colors.buttonBorder).not.toBe('rgba(0, 0, 0, 0)');
  expect(colors.cardBackground).not.toBe(colors.cardColor);
});

test('mobile homepage does not duplicate or cover its primary action buttons', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/modern/');

  await expect(page.locator('.modern-mobile-dock')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Call the office' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Directions' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Patient forms' }).first()).toBeVisible();
});

test('mobile services heading keeps Comprehensive intact and preserves dock clearance', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/modern/services/');

  const heading = page.locator('.modern-page-hero h1');
  await expect(heading).toBeVisible();
  await expect(page.locator('.modern-mobile-dock')).toBeVisible();

  const metrics = await heading.evaluate((element) => {
    const node = element.firstChild;
    if (!node || node.nodeType !== Node.TEXT_NODE) {
      return { firstWordRects: 99, overflowWrap: '', wordBreak: '', fontSize: 0 };
    }

    const firstWordLength = 'Comprehensive'.length;
    const range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, firstWordLength);
    const styles = getComputedStyle(element);

    return {
      firstWordRects: range.getClientRects().length,
      overflowWrap: styles.overflowWrap,
      wordBreak: styles.wordBreak,
      fontSize: Number.parseFloat(styles.fontSize)
    };
  });

  expect(metrics.firstWordRects).toBe(1);
  expect(metrics.overflowWrap).toBe('normal');
  expect(metrics.wordBreak).toBe('normal');
  expect(metrics.fontSize).toBeLessThanOrEqual(48);

  const mainPadding = await page.locator('#modern-main').evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).paddingBottom)
  );
  expect(mainPadding).toBeGreaterThan(80);
});

test('modern header uses the shared horizontal logo on an explicit light card', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/modern/');

  const logo = page.locator('.modern-brand img');
  await expect(logo).toHaveAttribute('src', '/images/donovan-logo.svg');
  const metrics = await logo.evaluate((element) => {
    const image = element as HTMLImageElement;
    const styles = getComputedStyle(image);
    const parentStyles = getComputedStyle(image.parentElement!);
    const rect = image.getBoundingClientRect();
    return {
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      width: rect.width,
      height: rect.height,
      imageBackground: styles.backgroundColor,
      imageFilter: styles.filter,
      parentBackground: parentStyles.backgroundColor,
      parentRadius: Number.parseFloat(parentStyles.borderRadius)
    };
  });

  expect(metrics.complete).toBe(true);
  expect(metrics.naturalWidth).toBeGreaterThan(0);
  expect(metrics.width).toBeGreaterThan(140);
  expect(metrics.height).toBeLessThan(80);
  expect(metrics.imageBackground).toBe('rgb(255, 255, 255)');
  expect(metrics.imageFilter).toBe('none');
  expect(metrics.parentBackground).toBe('rgb(255, 255, 255)');
  expect(metrics.parentRadius).toBeGreaterThan(0);

  const response = await request.get('/images/donovan-logo.svg');
  expect(response.status()).toBeLessThan(400);
  const svg = await response.text();
  expect(svg).toContain('viewBox="0 0 510 138"');
  expect(svg).toContain('fill="#ffffff"');
  expect(svg).toContain('stroke="#006b93"');
  expect(svg).toContain('fill="#12233f"');
  expect(svg).toContain('fill="#72a928"');
  expect(svg).toContain('fill="#00749d"');
  expect(svg).toContain('color-scheme: only light');
  expect(svg).toContain('forced-color-adjust: none');
  expect(svg).not.toContain('<image');
});
