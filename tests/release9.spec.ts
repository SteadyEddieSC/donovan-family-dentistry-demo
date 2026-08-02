import { test, expect } from '@playwright/test';

test('shared logo artwork contains its own rounded white card', async ({ request }) => {
  const response = await request.get('/images/donovan-logo.svg');
  expect(response.status()).toBeLessThan(400);
  const svg = await response.text();
  expect(svg).toContain('viewBox="0 0 510 138"');
  expect(svg).toMatch(/<rect[^>]+rx="22"[^>]+ry="22"[^>]+fill="#(?:fff|ffffff)"[^>]*stroke="#006b93"[^>]*\/>/);
  expect(svg).toContain('color-scheme: only light');
  expect(svg).toContain('forced-color-adjust: none');
});

test('classic keeps its hardened surface while modern exposes only the SVG card', async ({ page }) => {
  await page.goto('/');
  const classic = await page.locator('.brand').evaluate((element) => {
    const computed = getComputedStyle(element);
    const image = element.querySelector('img');
    const imageStyles = image ? getComputedStyle(image) : null;
    return {
      background: computed.backgroundColor,
      padding: Number.parseFloat(computed.paddingTop),
      border: Number.parseFloat(computed.borderTopWidth),
      shadow: computed.boxShadow,
      imageBackground: imageStyles?.backgroundColor ?? '',
      imageFilter: imageStyles?.filter ?? '',
      imageSource: image?.getAttribute('src') ?? ''
    };
  });
  expect(classic.background).toBe('rgb(255, 255, 255)');
  expect(classic.padding).toBe(0);
  expect(classic.border).toBe(0);
  expect(classic.shadow).toBe('none');
  expect(classic.imageBackground).toBe('rgb(255, 255, 255)');
  expect(classic.imageFilter).toBe('none');
  expect(classic.imageSource).toBe('/images/donovan-logo.svg');

  await page.goto('/modern/');
  const modern = await page.locator('.modern-brand').evaluate((element) => {
    const computed = getComputedStyle(element);
    const image = element.querySelector('img');
    const imageStyles = image ? getComputedStyle(image) : null;
    const wrapperBox = element.getBoundingClientRect();
    const imageBox = image?.getBoundingClientRect();
    return {
      background: computed.backgroundColor,
      overflow: computed.overflow,
      radius: computed.borderRadius,
      padding: Number.parseFloat(computed.paddingTop),
      imageBackground: imageStyles?.backgroundColor ?? '',
      imageRadius: imageStyles?.borderRadius ?? '',
      imageFilter: imageStyles?.filter ?? '',
      imageSource: image?.getAttribute('src') ?? '',
      widthDifference: imageBox ? Math.abs(wrapperBox.width - imageBox.width) : 999,
      heightDifference: imageBox ? Math.abs(wrapperBox.height - imageBox.height) : 999
    };
  });
  expect(modern.background).toBe('rgba(0, 0, 0, 0)');
  expect(modern.overflow).toBe('visible');
  expect(modern.radius).toBe('0px');
  expect(modern.padding).toBe(0);
  expect(modern.imageBackground).toBe('rgba(0, 0, 0, 0)');
  expect(modern.imageRadius).toBe('0px');
  expect(modern.imageFilter).toBe('none');
  expect(modern.imageSource).toBe('/images/donovan-logo.svg');
  expect(modern.widthDifference).toBeLessThanOrEqual(1);
  expect(modern.heightDifference).toBeLessThanOrEqual(1);
});

test('modern mobile footer stacks without narrow columns', async ({ page, isMobile }, testInfo) => {
  test.skip(!isMobile, 'Mobile-only layout assertion');
  await page.goto('/modern/');
  const footer = page.locator('.modern-footer');
  await footer.scrollIntoViewIfNeeded();
  await expect(page.locator('.modern-footer__logo-card img')).toBeVisible();

  const metrics = await page.locator('.modern-footer__grid').evaluate((grid) => {
    const columns = getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).filter(Boolean);
    const children = Array.from(grid.children).map((child) => child.getBoundingClientRect());
    return {
      columnCount: columns.length,
      firstBottom: children[0]?.bottom ?? 0,
      secondTop: children[1]?.top ?? 0,
      secondBottom: children[1]?.bottom ?? 0,
      thirdTop: children[2]?.top ?? 0
    };
  });

  expect(metrics.columnCount).toBe(1);
  expect(metrics.secondTop).toBeGreaterThanOrEqual(metrics.firstBottom);
  expect(metrics.thirdTop).toBeGreaterThanOrEqual(metrics.secondBottom);
  await footer.screenshot({ path: testInfo.outputPath('modern-mobile-footer.png'), animations: 'disabled' });
});
