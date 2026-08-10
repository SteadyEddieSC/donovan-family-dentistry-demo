import { test, expect } from '@playwright/test';

test('/ keeps the final Classic desktop actions compact and presents both dentists', async ({ page, isMobile }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  const headerPhone = page.locator('.nav-call');
  await expect(headerPhone).toHaveText('(843) 525-6866');
  await expect(headerPhone).toHaveAttribute('href', 'tel:+18435256866');

  await expect(page.getByRole('heading', { name: 'Experienced dentists, comprehensive family care' })).toBeVisible();
  await expect(page.getByText(/Dr\. William Donovan and Dr\. Jordan Henke provide care for patients of all ages/i)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Meet the dentists' })).toHaveAttribute('href', '/about/');

  if (!isMobile) {
    const actions = [
      page.getByRole('link', { name: 'Call the office' }),
      page.getByRole('link', { name: 'Get directions' }),
      page.getByRole('link', { name: 'Patient forms' })
    ];
    const boxes = await Promise.all(actions.map((action) => action.boundingBox()));
    expect(boxes.every(Boolean)).toBeTruthy();
    const yValues = boxes.map((box) => box!.y);
    expect(Math.max(...yValues) - Math.min(...yValues)).toBeLessThan(4);
  }
});

test('/contact/ shows the verified office hours, email, and prominent contact-card download', async ({ page }, testInfo) => {
  await page.goto('/contact/', { waitUntil: 'networkidle' });

  const download = page.getByRole('link', { name: 'Download Office Contact Card' });
  await expect(download).toBeVisible();
  await expect(download).toHaveAttribute('href', '/donovan-family-dentistry.vcf');
  await expect(download).toHaveClass(/button--primary/);
  await expect(page.getByText(/open the file and choose Add or Save to Contacts/i)).toBeVisible();

  const phoneCard = page.locator('.contact-card').filter({ hasText: 'Phone' });
  const downloadBox = await download.boundingBox();
  const phoneBox = await phoneCard.boundingBox();
  expect(downloadBox).not.toBeNull();
  expect(phoneBox).not.toBeNull();
  expect(downloadBox!.y).toBeLessThan(phoneBox!.y);

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
