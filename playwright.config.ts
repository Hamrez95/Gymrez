import { defineConfig, devices } from '@playwright/test';
process.env.PLAYWRIGHT_BROWSERS_PATH ??= '.cache/playwright';
const syntheticEnvironment = { VITE_SUPABASE_URL: 'https://gymrez-test.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_synthetic_e2e', VITE_GUEST_MODE: 'true' };
export default defineConfig({
  testDir: './tests/e2e',
  use: { launchOptions: { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }, baseURL: 'http://127.0.0.1:4173' },
  webServer: [
    { env: syntheticEnvironment, command: 'npm run dev -- --port 4173 --strictPort', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI },
    { env: syntheticEnvironment, command: 'npm run build && npm run preview -- --port 4174 --strictPort', url: 'http://127.0.0.1:4174', reuseExistingServer: !process.env.CI },
  ],
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'pwa-offline', testMatch: '**/private-sync.spec.ts', use: { ...devices['Pixel 7'], baseURL: 'http://127.0.0.1:4174' } },
  ],
});
