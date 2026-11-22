import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/specs',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'Mobile-iPhone',
      use: {
        ...devices['iPhone 14'],
        viewport: { width: 414, height: 896 },
      },
    },
    {
      name: 'Desktop-Web',
      use: {
        viewport: { width: 1672, height: 941 },
      },
    },
  ],
  webServer: {
    command: 'npm --prefix frontend run dev',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
    timeout: 60000,
  },
});
