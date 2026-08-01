import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { test, expect } from '@playwright/test';

const repositoryRoot = process.cwd();
const configuredSite = 'https://donovan-family-dentistry-demo.pages.dev';
const publicRoutes = [
  '/', '/about/', '/services/', '/forms/', '/contact/', '/accessibility/', '/website-use/',
  '/modern/', '/modern/about/', '/modern/services/', '/modern/team/', '/modern/new-patients/', '/modern/forms/', '/modern/contact/'
];

test('production-candidate safety gate preserves preview controls and launch blockers', async ({ isMobile }) => {
  test.skip(isMobile, 'Repository-level validation only needs to run once.');
  const result = spawnSync(process.execPath, ['scripts/check-production-candidate.mjs'], {
    cwd: repositoryRoot,
    encoding: 'utf8'
  });
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toContain('preview indexing disabled');
  expect(result.stdout).toContain('5 enforced launch blocker');
});

test('release 14 evidence distinguishes automated coverage from pending real-device review', async ({ isMobile }) => {
  test.skip(isMobile, 'Repository-level validation only needs to run once.');
  const evidence = readFileSync(path.join(repositoryRoot, 'docs/release-14-production-candidate.md'), 'utf8');
  expect(evidence).toContain('Real-device manual verification');
  expect(evidence).toContain('Status: pending before production launch');
  expect(evidence).toContain('does **not** authorize public indexing');
});

for (const route of publicRoutes) {
  test(`${route} exposes production-candidate metadata and preview-safe discovery controls`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow, noarchive');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${configuredSite}${route}`);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `${configuredSite}/images/donovan-social-card.webp`);
    await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute('content', 'image/webp');
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
    await expect(page.locator('meta[property="og:image:alt"]')).not.toHaveAttribute('content', '');

    const jsonLd = JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent() ?? '{}');
    const graph: any[] = jsonLd['@graph'];
    const webPage = graph.find((item) => item['@type'] === 'WebPage');
    expect(webPage.primaryImageOfPage.width).toBe(1200);
    expect(webPage.primaryImageOfPage.height).toBe(630);
    expect(webPage.primaryImageOfPage.contentUrl).toBe(`${configuredSite}/images/donovan-social-card.webp`);
  });
}

test('sitemap contains each public route exactly once', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toMatch(/^(application|text)\/xml\b/i);
  const body = await response.text();
  const locations = [...body.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  expect(locations).toHaveLength(publicRoutes.length);
  expect(new Set(locations).size).toBe(locations.length);
  for (const route of publicRoutes) expect(locations).toContain(`${configuredSite}${route}`);
});

test('responsive photography and the social card are generated and addressable', async ({ page, request }) => {
  await page.goto('/modern/');
  const hero = page.locator('.modern-hero__visual img');
  await expect(hero).toHaveAttribute('srcset', /office-exterior-480\.webp 480w.*office-exterior-720\.webp 720w.*office-exterior\.webp 900w/);
  await expect(hero).toHaveAttribute('sizes', /50vw/);
  await expect(hero).toHaveAttribute('width', '900');
  await expect(hero).toHaveAttribute('height', '675');

  await page.goto('/modern/team/');
  const providerPhoto = page.getByRole('img', { name: 'Dr. William Donovan with his family and dog outdoors.' });
  await expect(providerPhoto).toHaveAttribute('srcset', /dr-william-donovan-family-480\.webp 480w.*720\.webp 720w/);
  await expect(providerPhoto).toHaveAttribute('width', '900');
  await expect(providerPhoto).toHaveAttribute('height', '720');

  for (const asset of [
    '/images/office-exterior-480.webp',
    '/images/office-exterior-720.webp',
    '/images/dr-william-donovan-family-480.webp',
    '/images/dr-william-donovan-family-720.webp',
    '/images/donovan-social-card.webp'
  ]) {
    const response = await request.get(asset);
    expect(response.status(), `${asset} should resolve`).toBe(200);
    expect(response.headers()['content-type']).toContain('image/webp');
  }
});

test('keyboard focus uses a strong visible indicator', async ({ page }) => {
  await page.goto('/modern/contact/');
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toBeVisible();
  const styles = await focused.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      width: Number.parseFloat(computed.outlineWidth),
      style: computed.outlineStyle,
      offset: Number.parseFloat(computed.outlineOffset)
    };
  });
  expect(styles.width).toBeGreaterThanOrEqual(3);
  expect(styles.style).toBe('solid');
  expect(styles.offset).toBeGreaterThanOrEqual(3);
});

test('visible form and navigation controls meet minimum target sizing', async ({ page }) => {
  await page.goto('/modern/contact/');
  const targets = page.locator([
    '.modern-call',
    '.modern-menu summary',
    '.modern-nav a',
    '#modern-inquiry-form input',
    '#modern-inquiry-form select',
    '#modern-inquiry-form textarea',
    '#modern-inquiry-form button'
  ].join(','));

  for (let index = 0; index < await targets.count(); index += 1) {
    const target = targets.nth(index);
    if (!(await target.isVisible())) continue;
    const box = await target.boundingBox();
    expect(box, `target ${index} should have a box`).not.toBeNull();
    expect(box!.width, `target ${index} width`).toBeGreaterThanOrEqual(24);
    expect(box!.height, `target ${index} height`).toBeGreaterThanOrEqual(24);
  }
});

test('keyboard-focused controls are not hidden by authored content', async ({ page }) => {
  await page.goto('/modern/contact/');
  for (let index = 0; index < 18; index += 1) {
    await page.keyboard.press('Tab');
    const descriptor = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) return 'no focused element';
      const name = active.getAttribute('aria-label') || active.textContent?.trim() || active.id || active.className;
      return `${active.tagName.toLowerCase()} ${String(name).replace(/\s+/g, ' ').slice(0, 80)}`.trim();
    });

    await expect.poll(async () => page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null;
      if (!active || active === document.body) return true;
      const rect = active.getBoundingClientRect();
      const x = Math.min(Math.max(rect.left + rect.width / 2, 1), window.innerWidth - 1);
      const y = Math.min(Math.max(rect.top + rect.height / 2, 1), window.innerHeight - 1);
      const covering = document.elementFromPoint(x, y);
      return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight && Boolean(covering && (covering === active || active.contains(covering) || covering.contains(active)));
    }), {
      message: `${descriptor} should remain visible when focused`,
      timeout: 1500
    }).toBe(true);
  }
});

test('pages reflow at a 320 CSS-pixel viewport without horizontal page scrolling', async ({ page, isMobile }) => {
  test.skip(isMobile, 'The desktop project performs the explicit 320px reflow check.');
  await page.setViewportSize({ width: 320, height: 900 });
  for (const route of ['/modern/', '/modern/new-patients/', '/modern/contact/', '/accessibility/', '/website-use/']) {
    await page.goto(route);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${route} should reflow at 320px`).toBeLessThanOrEqual(1);
  }
});

test('reduced-motion preference disables smooth motion without removing functionality', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/modern/');
  const styles = await page.locator('.modern-button').first().evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      transitionDuration: computed.transitionDuration,
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior
    };
  });
  expect(styles.scrollBehavior).toBe('auto');
  const longestTransition = Math.max(...styles.transitionDuration.split(',').map((value) => {
    const trimmed = value.trim();
    return trimmed.endsWith('ms') ? Number.parseFloat(trimmed) : Number.parseFloat(trimmed) * 1000;
  }));
  expect(longestTransition).toBeLessThanOrEqual(1);
  await expect(page.getByRole('link', { name: 'Request a call' })).toBeVisible();
});

test('local laboratory metrics stay within production-candidate guardrails', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).__release14Cls = 0;
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) (window as any).__release14Cls += entry.value;
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true } as PerformanceObserverInit);
    } catch {
      (window as any).__release14Cls = 0;
    }
  });
  await page.goto('/modern/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(250);
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    return {
      cls: Number((window as any).__release14Cls ?? 0),
      loadMs: navigation ? navigation.loadEventEnd - navigation.startTime : 0,
      resources: performance.getEntriesByType('resource').length
    };
  });
  expect(metrics.cls).toBeLessThanOrEqual(0.1);
  expect(metrics.loadMs).toBeLessThanOrEqual(5000);
  expect(metrics.resources).toBeLessThanOrEqual(35);
});

test('public safety and accessibility language is present', async ({ page }) => {
  await page.goto('/accessibility/');
  await expect(page.getByRole('heading', { name: 'Report an accessibility barrier' })).toBeVisible();
  await expect(page.getByText('Final verification on current physical iOS', { exact: false })).toBeVisible();

  await page.goto('/website-use/');
  await expect(page.getByRole('heading', { name: 'General information only' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Urgent concerns' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Insurance and payment' })).toBeVisible();
  await expect(page.getByText('sends nothing unless an administrator', { exact: false })).toBeVisible();
});

test('release 14 production-candidate screenshots', async ({ page }, testInfo) => {
  await page.goto('/modern/');
  await page.screenshot({ path: testInfo.outputPath(`release14-modern-home-${testInfo.project.name}.png`), fullPage: true, animations: 'disabled' });
  await page.goto('/modern/contact/');
  await page.screenshot({ path: testInfo.outputPath(`release14-modern-contact-${testInfo.project.name}.png`), fullPage: true, animations: 'disabled' });
  await page.goto('/accessibility/');
  await page.screenshot({ path: testInfo.outputPath(`release14-accessibility-${testInfo.project.name}.png`), fullPage: true, animations: 'disabled' });
});
