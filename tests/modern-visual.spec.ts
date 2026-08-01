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
