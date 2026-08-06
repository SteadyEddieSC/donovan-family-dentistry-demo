import { test, expect } from '@playwright/test';

for (const path of ['/about/', '/modern/team/']) {
  test(`${path} preserves sharp provider photos without captions or Google Fonts`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    const externalFontRequests: string[] = [];
    page.on('request', (request) => {
      if (/fonts\.(googleapis|gstatic)\.com/i.test(request.url())) externalFontRequests.push(request.url());
    });

    await page.goto(path, { waitUntil: 'networkidle' });
    await expect(page.getByText('Henke Family', { exact: true })).toHaveCount(0);

    const images = page.locator('img[src*="dr-william-donovan-photo"], img[src*="dr-jordan-henke-family"]');
    await expect(images).toHaveCount(2);

    const expectedNaturalWidth = path === '/about/' ? 240 : 480;
    for (let index = 0; index < 2; index += 1) {
      const image = images.nth(index);
      await image.scrollIntoViewIfNeeded();
      await expect(image).toBeVisible();
      await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth)).toBe(expectedNaturalWidth);
      if (path === '/about/') {
        await expect(image).toHaveAttribute('srcset', /-240\.webp 240w, .*r16-12\.webp 480w/);
        await expect(image).toHaveAttribute('sizes', /192px/);
      }
    }

    const details = await images.evaluateAll((elements) => elements.map((element) => {
      const image = element as HTMLImageElement;
      const styles = getComputedStyle(image);
      return {
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        displayedWidth: image.getBoundingClientRect().width,
        objectFit: styles.objectFit,
        height: styles.height,
        aspectRatio: styles.aspectRatio
      };
    }));

    expect(details.map((item) => item.naturalWidth)).toEqual([expectedNaturalWidth, expectedNaturalWidth]);
    for (const item of details) {
      expect(item.complete).toBe(true);
      expect(item.displayedWidth).toBeLessThanOrEqual(481);
      expect(item.objectFit).toBe('contain');
      expect(item.height).not.toBe('180px');
    }

    const geometry = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth
    }));
    expect(geometry.documentWidth).toBe(geometry.viewportWidth);
    expect(externalFontRequests).toEqual([]);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: testInfo.outputPath(`release16-12-${path.includes('modern') ? 'modern-team' : 'classic-about'}.png`),
      fullPage: true
    });
  });
}
