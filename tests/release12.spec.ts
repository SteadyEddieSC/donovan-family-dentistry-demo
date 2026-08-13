import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const readJson = (relativePath: string) => JSON.parse(
  readFileSync(path.join(repositoryRoot, relativePath), 'utf8')
);

test('office-managed content passes the prebuild validator', async ({ isMobile }) => {
  test.skip(isMobile, 'Repository-level validation only needs to run once.');
  const result = spawnSync(process.execPath, ['scripts/check-editor-content.mjs'], {
    cwd: repositoryRoot,
    encoding: 'utf8'
  });
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toContain('Office content validation passed');
  expect(result.stdout).toContain('12 visible service(s)');
});

test('Pages CMS exposes a grouped office editor and one-click website check', async ({ isMobile }) => {
  test.skip(isMobile, 'Repository-level validation only needs to run once.');
  const config = readFileSync(path.join(repositoryRoot, '.pages.yml'), 'utf8');
  const workflow = readFileSync(path.join(repositoryRoot, '.github/workflows/office-site-check.yml'), 'utf8');

  expect(config).toContain('label: Build and verify website');
  expect(config).toContain('workflow: office-site-check.yml');
  expect(config).toContain('label: Current website quick updates');
  expect(config).toContain('label: Dentist profiles');
  expect(config).toContain('label: Services and patient forms');
  expect(config).not.toContain('path: src/data/practice-content.json');
  expect(config).not.toContain('path: src/data/modern-team.json');
  expect(config).toContain('path: src/data/providers.json');
  expect(config).toContain('merge: true');

  expect(workflow).toContain('workflow_dispatch:');
  expect(workflow).toContain('npm run build');
  expect(workflow).toContain('npm run test:e2e');
  expect(workflow).toContain('Website check passed');
});

test('public team page contains no fictional person identities', async ({ page }) => {
  await page.goto('/modern/team/');
  await expect(page.getByRole('heading', { name: 'Dr. William Donovan, DMD' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dr. Jordan Henke, DDS' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Front Office Team' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dental Hygiene Team' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dental Assisting Team' })).toBeVisible();

  for (const fictionalName of ['Caroline Whitaker', 'Megan Ellis', 'Brooke Simmons', 'Taylor Reed', 'Allison Harper', 'Jordan Bell', 'Sofia Bennett']) {
    await expect(page.getByText(fictionalName, { exact: false })).toHaveCount(0);
  }
  await expect(page.getByText('Associate Dentist', { exact: true })).toHaveCount(0);
  await expect(page.getByText(/Koolkin/i)).toHaveCount(0);
});

test('classic and modern concepts share the approved provider source', async ({ page }) => {
  const providers = readJson('src/data/providers.json');
  const visibleProviders = providers.filter((provider: { visible: boolean }) => provider.visible);
  expect(visibleProviders.map((provider: { id: string }) => provider.id)).toEqual(['william-donovan', 'jordan-henke']);
  expect(providers.find((provider: { id: string }) => provider.id === 'associate-dentist-template')).toBeUndefined();

  for (const route of ['/about/', '/modern/team/']) {
    await page.goto(route);
    await expect(page.getByRole('heading', { name: 'Dr. William Donovan, DMD' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dr. Jordan Henke, DDS' })).toBeVisible();
  }
});

test('about and services pages render office-managed content', async ({ page }) => {
  const practiceContent = readJson('src/data/practice-content.json');
  const services = readJson('src/data/services.json').filter((service: { visible: boolean }) => service.visible);

  await page.goto('/modern/about/');
  await expect(page.getByRole('heading', { name: practiceContent.about.headline })).toBeVisible();
  await expect(page.getByText(practiceContent.about.storyParagraphs[1], { exact: true })).toBeVisible();
  await expect(page.getByText('welcomed generations', { exact: false })).toHaveCount(0);

  await page.goto('/modern/services/');
  await expect(page.getByRole('heading', { name: practiceContent.servicesPage.headline })).toBeVisible();
  for (const group of practiceContent.servicesPage.groups) {
    await expect(page.getByRole('heading', { name: group.title })).toBeVisible();
  }
  for (const service of services) {
    await expect(page.getByText(service.name, { exact: true })).toBeVisible();
  }
});

test('clean browsers make no external font requests', async ({ page }) => {
  const externalFontRequests: string[] = [];
  page.on('request', (request) => {
    if (/fonts\.(googleapis|gstatic)\.com/i.test(request.url())) externalFontRequests.push(request.url());
  });

  for (const route of ['/', '/modern/', '/modern/team/']) {
    await page.goto(route);
    const fontFamily = await page.locator('body').evaluate((element) => getComputedStyle(element).fontFamily);
    expect(fontFamily).not.toMatch(/Inter|DM Mono/i);
  }

  expect(externalFontRequests).toEqual([]);
});

test('modern team mobile review screenshot', async ({ page, isMobile }, testInfo) => {
  test.skip(!isMobile, 'Mobile-only visual review');
  await page.goto('/modern/team/');
  await page.screenshot({
    path: testInfo.outputPath('release12-modern-team-mobile.png'),
    fullPage: true,
    animations: 'disabled'
  });
});
