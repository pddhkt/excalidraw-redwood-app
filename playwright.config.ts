import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  // Global timeout for all tests (increased for authenticated tests with 30s sessions)
  timeout: 45000, // 45 seconds

  // Expect timeout for assertions
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    // Enable headed mode for session token tests
    headless: process.env.HEADLESS !== 'false',

    // Action timeout (for clicks, fills, etc)
    actionTimeout: 10000,

    // Navigation timeout
    navigationTimeout: 15000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes for server to start
  },
})