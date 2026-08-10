import { test, expect } from '@playwright/test';

test('/contact/ shows the verified office hours and email from the shared site record', async ({ page }, testInfo) => {
  await page.goto('/contact/', { waitUntil: 'networkidle' });

  for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday']) {
    const row = page.getByRole('row', { name: new RegExp(`${day}\\s+7:30 AM-5:00 PM`, 'i') });
    await expect(row).toBeVisible();
  }
  await expect(page.getByRole('link', { name: 'dfdbeaufort@gmail.com' })).toHaveAttribute('href', 'mailto:dfdbeaufort@gmail.com');

  await page.screenshot({
    path: testInfo.outputPath('release17-prelaunch-classic-contact-hours.png'),
    fullPage: true
  });
});

test('/modern/contact/ remains a noindex future-design demo with matching contact details', async ({ page }) => {
  await page.goto('/modern/contact/', { waitUntil: 'networkidle' });

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.getByText('Future design demo. Not the current public website.')).toBeVisible();
  await expect(page.getByRole('row', { name: /Monday\s+7:30 AM-5:00 PM/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /dfdbeaufort@gmail.com/i })).toHaveAttribute('href', 'mailto:dfdbeaufort@gmail.com');
});

test('prelaunch robots policy blocks indexing until the final launch switch', async ({ request }) => {
  const response = await request.get('/robots.txt');
  expect(response.ok()).toBeTruthy();
  expect(await response.text()).toBe('User-agent: *\nDisallow: /\n');
});

test('the public sitemap contains Classic routes only', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.ok()).toBeTruthy();
  const body = await response.text();

  expect(body).toContain('<loc>https://donovan-family-dentistry-demo.pages.dev/</loc>');
  expect(body).toContain('/about/');
  expect(body).toContain('/services/');
  expect(body).toContain('/forms/');
  expect(body).toContain('/contact/');
  expect(body).not.toContain('/modern/');
  expect(body).not.toContain('/review/');
});
