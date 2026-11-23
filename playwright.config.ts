import { defineConfig, devices } from '@playwright/test';

// Staging environment URLs
const STAGING_URL = 'https://demo-du-an-s7j9.onrender.com';
const LOCAL_URL = 'http://127.0.0.1:5173';

const baseURL = process.env.BASE_URL || (process.env.TEST_ENV === 'local' ? LOCAL_URL : STAGING_URL);
const isRemote = baseURL.startsWith('https://') || (!baseURL.includes('127.0.0.1') && !baseURL.includes('localhost'));

export default defineConfig({
  testDir: './tests/specs',
  timeout: isRemote ? 90000 : 60000,
  expect: {
    timeout: isRemote ? 15000 : 10000,
  },
  fullyParallel: false,
  workers: 1,
  retries: isRemote ? 1 : 0,
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL,
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'Desktop-Web',
      use: {
        viewport: { width: 1672, height: 941 },
      },
    },
    {
      name: 'Mobile-iPhone',
      use: {
        ...devices['iPhone 14'],
        viewport: { width: 414, height: 896 },
      },
    },
  ],
  ...(isRemote
    ? {}
    : {
        webServer: {
          command: 'npm --prefix frontend run dev',
          url: LOCAL_URL,
          reuseExistingServer: true,
          timeout: 60000,
        },
      }),
});
