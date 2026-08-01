import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test, expect } from '@playwright/test';

const repositoryRoot = process.cwd();

test('administrative inquiry remains a same-origin preview until explicitly activated', async ({ page }) => {
  await page.goto('/modern/contact/');
  const form = page.locator('#modern-inquiry-form');
  await expect(form).toHaveAttribute('action', '/api/administrative-inquiry');
  await expect(form).toHaveAttribute('data-mode', 'preview');
  await expect(form).toHaveAttribute('data-turnstile', 'disabled');
  await expect(page.locator('.cf-turnstile')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Preview request' })).toBeVisible();

  const startedAt = await form.locator('input[name="form_started_at"]').inputValue();
  expect(Number(startedAt)).toBeGreaterThan(0);
  expect(await page.locator('html').textContent()).not.toContain('usebasin.com');
});

test('previewing an inquiry does not call the serverless endpoint', async ({ page }) => {
  let endpointCalls = 0;
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/administrative-inquiry') endpointCalls += 1;
  });

  await page.goto('/modern/contact/');
  await page.getByLabel('Name').fill('Alex Patient');
  await page.getByLabel('Phone').fill('(843) 555-0100');
  await page.getByLabel('Email').fill('alex@example.com');
  await page.getByLabel('Administrative message').fill('Please call me about appointment availability.');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Preview request' }).click();

  await expect(page.getByRole('status')).toContainText('Preview complete - nothing was sent');
  await expect(page.getByRole('status')).toContainText('Alex Patient');
  expect(endpointCalls).toBe(0);
});

test('clear resets the private preview and starts a fresh timing window', async ({ page }) => {
  await page.goto('/modern/contact/');
  const startedAt = page.locator('input[name="form_started_at"]');
  const before = Number(await startedAt.inputValue());

  await page.getByLabel('Name').fill('Alex Patient');
  await page.getByLabel('Phone').fill('(843) 555-0100');
  await page.getByLabel('Administrative message').fill('Please call me about appointment availability.');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Preview request' }).click();
  await expect(page.getByRole('status')).toBeVisible();

  await page.getByRole('button', { name: 'Clear' }).click();
  await expect(page.getByRole('status')).toBeHidden();
  await expect.poll(async () => Number(await startedAt.inputValue())).toBeGreaterThanOrEqual(before);
});

test('contact page omits the duplicate mobile dock while other pages retain it', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile-only overlap safeguard.');

  await page.goto('/modern/contact/');
  await expect(page.locator('.modern-mobile-dock')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Call the office' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open directions' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Patient forms' }).first()).toBeVisible();

  await page.goto('/modern/');
  await expect(page.locator('.modern-mobile-dock')).toBeVisible();
});

test('browser security policy no longer permits direct Basin submission', async () => {
  const headers = await readFile(path.join(repositoryRoot, 'public/_headers'), 'utf8');
  expect(headers).toContain("form-action 'self'");
  expect(headers).not.toContain('https://usebasin.com');

  const routes = JSON.parse(await readFile(path.join(repositoryRoot, 'public/_routes.json'), 'utf8'));
  expect(routes).toEqual({ version: 1, include: ['/api/*'], exclude: [] });
});

test('runtime secrets are separated from public build variables', async () => {
  const publicExample = await readFile(path.join(repositoryRoot, '.env.example'), 'utf8');
  const runtimeExample = await readFile(path.join(repositoryRoot, '.dev.vars.example'), 'utf8');
  const contactPage = await readFile(path.join(repositoryRoot, 'src/pages/modern/contact.astro'), 'utf8');

  expect(publicExample).toContain('PUBLIC_ADMIN_INQUIRY_ENABLED=false');
  expect(publicExample).toContain('PUBLIC_TURNSTILE_SITE_KEY=');
  expect(publicExample).not.toContain('PUBLIC_BASIN_FORM_ENDPOINT=');
  expect(runtimeExample).toContain('BASIN_FORM_ENDPOINT=');
  expect(runtimeExample).toContain('TURNSTILE_SECRET_KEY=');
  expect(contactPage).not.toContain('PUBLIC_BASIN_FORM_ENDPOINT');
  expect(contactPage).not.toContain('BASIN_FORM_ENDPOINT');
});

test('release 13 contact-page review screenshot', async ({ page }, testInfo) => {
  await page.goto('/modern/contact/');
  await page.screenshot({
    path: testInfo.outputPath(`release13-contact-${testInfo.project.name}.png`),
    fullPage: true,
    animations: 'disabled'
  });
});
