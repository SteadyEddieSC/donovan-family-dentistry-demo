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

test('classic and modern logo wrappers use the same explicit light surface without a second card', async ({ page }) => {
  for (const path of ['/', '/modern/']) {
    await page.goto(path);
    const selector = path === '/' ? '.brand' : '.modern-brand';
    const styles = await page.locator(selector).evaluate((element) => {
      const computed = getComputedStyle(element);
      const image = element.querySelector('img');
      const imageStyles = image ? getComputedStyle(image) : null;
      const wrapperBox = element.getBoundingClientRect();
      const imageBox = image?.getBoundingClientRect();
      return {
        backgroundColor: computed.backgroundColor,
        backgroundImage: computed.backgroundImage,
        padding: Number.parseFloat(computed.paddingTop),
        border: Number.parseFloat(computed.borderTopWidth),
        shadow: computed.boxShadow,
        radius: Number.parseFloat(computed.borderRadius),
        imageBackground: imageStyles?.backgroundColor ?? '',
        imageFilter: imageStyles?.filter ?? '',
        imageSource: image?.getAttribute('src') ?? '',
        widthDifference: imageBox ? Math.abs(wrapperBox.width - imageBox.width) : 999,
        heightDifference: imageBox ? Math.abs(wrapperBox.height - imageBox.height) : 999
      };
    });

    expect(styles.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(styles.backgroundImage).toBe('none');
    expect(styles.padding).toBe(0);
    expect(styles.border).toBe(0);
    expect(styles.shadow).toBe('none');
    expect(styles.radius).toBeGreaterThan(0);
    expect(styles.imageBackground).toBe('rgb(255, 255, 255)');
    expect(styles.imageFilter).toBe('none');
    expect(styles.imageSource).toBe('/images/donovan-logo.svg');
    expect(styles.widthDifference).toBeLessThanOrEqual(1);
    expect(styles.heightDifference).toBeLessThanOrEqual(1);
  }
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
