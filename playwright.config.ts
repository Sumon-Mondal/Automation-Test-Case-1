import { defineConfig, devices } from '@playwright/test';

const slowMoMs = numberFromEnv('PLAYWRIGHT_SLOW_MO_MS', 0);

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  use: {
    baseURL: process.env.DEMO_APP_URL ?? 'https://animated-gingersnap-8cf7f2.netlify.app/',
    locale: 'en-US',
    timezoneId: 'America/New_York',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ...(slowMoMs > 0 ? { launchOptions: { slowMo: slowMoMs } } : {})
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});

function numberFromEnv(name: string, fallback: number): number {
  const value = Number(process.env[name]);

  return Number.isFinite(value) ? value : fallback;
}
