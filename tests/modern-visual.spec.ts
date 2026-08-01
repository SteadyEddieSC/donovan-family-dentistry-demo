import { test, expect } from '@playwright/test';

test('team privacy card remains readable in the dark section', async ({ page }) => {
  await page.goto('/modern/team/');
  const card = page.locator('.modern-section--deep .modern-visit-card');
  await expect(card.getByRole('heading', { name: 'Privacy reminder' })).toBeVisible();
  await expect(card).toContainText('Do not send symptoms');
  const colors = await card.evaluate((element) => {
    const cardStyles = getComputedStyle(element);
    const heading = element.querySelector('h3');
    const paragraph = element.querySelector('p');
    return {
      background: cardStyles.backgroundColor,
      heading: heading ? getComputedStyle(heading).color : '',
      paragraph: paragraph ? getComputedStyle(paragraph).color : ''
    };
  });
  expect(colors.heading).not.toBe(colors.background);
  expect(colors.paragraph).not.toBe(colors.background);
});

test('modern dark mode keeps cards, buttons, and logo readable', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/modern/');

  const logoCard = page.locator('.modern-brand');
  const requestButton = page.getByRole('link', { name: 'Request a call' });
  const pathCard = page.locator('.modern-path-card').first();

  const colors = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const logo = getComputedStyle(document.querySelector('.modern-brand')!);
    const button = getComputedStyle(Array.from(document.querySelectorAll('a')).find((item) => item.textContent?.trim() === 'Request a call')!);
    const card = getComputedStyle(document.querySelector('.modern-path-card')!);
    return {
      bodyBackground: body.backgroundColor,
      bodyColor: body.color,
      logoBackground: logo.backgroundColor,
      buttonColor: button.color,
      buttonBorder: button.borderTopColor,
      cardBackground: card.backgroundColor,
      cardColor: card.color
    };
  });

  await expect(logoCard).toBeVisible();
  await expect(requestButton).toBeVisible();
  await expect(pathCard).toBeVisible();
  expect(colors.bodyBackground).not.toBe(colors.bodyColor);
  expect(colors.logoBackground).toBe('rgb(255, 255, 255)');
  expect(colors.buttonColor).not.toBe(colors.bodyBackground);
  expect(colors.buttonBorder).not.toBe('rgba(0, 0, 0, 0)');
  expect(colors.cardBackground).not.toBe(colors.cardColor);
});
