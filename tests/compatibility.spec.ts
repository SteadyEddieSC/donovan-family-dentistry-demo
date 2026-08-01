import { test, expect } from '@playwright/test';

const patientRoutes = [
  '/modern/',
  '/modern/new-patients/',
  '/modern/forms/',
  '/modern/contact/',
  '/accessibility/',
  '/website-use/'
];

test('production-candidate routes load without browser errors or horizontal overflow', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  for (const route of patientRoutes) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${route} should not scroll horizontally`).toBeLessThanOrEqual(1);
  }

  expect(browserErrors).toEqual([]);
});

test('primary navigation reaches the patient forms page', async ({ page }) => {
  await page.goto('/modern/');
  const menu = page.locator('.modern-menu');
  if (await menu.isVisible()) {
    await menu.locator('summary').click();
    await menu.getByRole('link', { name: 'Patient Forms' }).click();
  } else {
    await page.locator('.modern-nav').getByRole('link', { name: 'Patient Forms' }).click();
  }
  await expect(page).toHaveURL(/\/modern\/forms\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('patient PDF links resolve in every compatibility project', async ({ page, request }) => {
  await page.goto('/modern/forms/');
  const links = await page.locator('a[href$=".pdf"]').evaluateAll((anchors) =>
    anchors.map((anchor) => (anchor as HTMLAnchorElement).getAttribute('href')).filter((href): href is string => Boolean(href))
  );
  expect(links.length).toBeGreaterThanOrEqual(2);
  for (const href of links) {
    const response = await request.get(href);
    expect(response.status(), `${href} should resolve`).toBeLessThan(400);
    expect(response.headers()['content-type']).toContain('application/pdf');
  }
});

test('administrative inquiry stays local in preview mode', async ({ page }) => {
  let endpointCalls = 0;
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/administrative-inquiry') endpointCalls += 1;
  });

  await page.goto('/modern/contact/');
  await page.getByLabel('Name').fill('Compatibility Patient');
  await page.getByLabel('Phone').fill('(843) 555-0100');
  await page.getByLabel('Administrative message').fill('Please call me about general appointment availability.');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Preview request' }).click();

  await expect(page.getByRole('status')).toContainText('Preview complete - nothing was sent');
  expect(endpointCalls).toBe(0);
});
