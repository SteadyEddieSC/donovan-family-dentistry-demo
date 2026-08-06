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

    for (let index = 0; index < 2; index += 1) {
      const image = images.nth(index);
      await image.scrollIntoViewIfNeeded();
      await expect(image).toBeVisible();
      await expect.poll(() => image.evaluate((element: HTMLImageElement) => Boolean(element.complete && element.currentSrc))).toBe(true);
      if (path === '/about/') {
        await expect(image).toHaveAttribute('srcset', /-360\.webp 360w, .*r16-12\.webp 480w/);
        await expect(image).toHaveAttribute('sizes', /352px/);
        await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.currentSrc)).toMatch(/(?:-360|r16-12)\.webp$/);
      } else {
        await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.currentSrc)).toMatch(/r16-12\.webp$/);
      }
    }

    const details = await images.evaluateAll((elements) => elements.map((element) => {
      const image = element as HTMLImageElement;
      const styles = getComputedStyle(image);
      return {
        complete: image.complete,
        currentSrc: image.currentSrc,
        naturalWidth: image.naturalWidth,
        displayedWidth: image.getBoundingClientRect().width,
        objectFit: styles.objectFit,
        height: styles.height,
        aspectRatio: styles.aspectRatio
      };
    }));

    for (const item of details) {
      expect(item.complete).toBe(true);
      expect(item.currentSrc).not.toBe('');
      expect(item.naturalWidth).toBeGreaterThanOrEqual(Math.floor(item.displayedWidth));
      expect(item.displayedWidth).toBeLessThanOrEqual(481);
      expect(item.objectFit).toBe('contain');
      expect(item.height).not.toBe('180px');
      if (path === '/about/') {
        expect(item.currentSrc).toMatch(/(?:-360|r16-12)\.webp$/);
        expect(item.naturalWidth).toBeLessThanOrEqual(480);
      } else {
        expect(item.currentSrc).toMatch(/r16-12\.webp$/);
        expect(item.naturalWidth).toBe(480);
      }
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
