import { defineConfig, devices } from '@playwright/test';

const shared = {
  baseURL: 'http://127.0.0.1:4321',
  trace: 'on-first-retry' as const,
  screenshot: 'only-on-failure' as const
};

export default defineConfig({
  testDir: './tests',
  testMatch: '**/compatibility.spec.ts',
  outputDir: 'test-results-compatibility',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'playwright-report-compatibility', open: 'never' }]]
    : [['html', { outputFolder: 'playwright-report-compatibility', open: 'never' }]],
  use: shared,
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'], browserName: 'chromium', channel: 'chrome' }
    },
    {
      name: 'desktop-edge',
      use: { ...devices['Desktop Chrome'], browserName: 'chromium', channel: 'msedge' }
    },
    {
      name: 'desktop-firefox',
      use: { ...devices['Desktop Firefox'], browserName: 'firefox' }
    },
    {
      name: 'desktop-webkit',
      use: { ...devices['Desktop Safari'], browserName: 'webkit' }
    },
    {
      name: 'android-chrome',
      use: { ...devices['Pixel 7'], browserName: 'chromium', channel: 'chrome' }
    },
    {
      name: 'ios-webkit',
      use: { ...devices['iPhone 14'], browserName: 'webkit' }
    }
  ]
});
