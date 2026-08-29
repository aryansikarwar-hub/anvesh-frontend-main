import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end configuration.
 *
 * These specs drive the three real portals against a real API and a real
 * MongoDB. They are deliberately NOT wired to spawn the stack themselves: the
 * app must already be running, so a failure here is a failure of the
 * application rather than of a fixture.
 *
 * Prerequisites — see ../docs/testing.md (this suite lives at frontend/e2e/,
 * a sibling of the app it drives; the API lives in the sibling `backend/`
 * folder one level up from `frontend/`):
 *   1. MongoDB reachable (Atlas, or a local mongod)
 *   2. cd ../../backend && npm run db:migrate && npm run db:seed
 *   3. cd ../../backend && npm run dev     (api  :4000)
 *   4. cd ..            && npm run dev     (app  :3000 — all three portals)
 *
 * A note on booking: those flows use MongoDB transactions, which need a
 * replica set. Against a standalone mongod they still run, without atomicity.
 */
const WEB = process.env.E2E_WEB_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.e2e.ts',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  use: {
    baseURL: WEB,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'traveller', use: { ...devices['Desktop Chrome'] }, testMatch: '**/traveller.e2e.ts' },
    { name: 'guide', use: { ...devices['Desktop Chrome'] }, testMatch: '**/guide.e2e.ts' },
    { name: 'admin', use: { ...devices['Desktop Chrome'] }, testMatch: '**/admin.e2e.ts' },
  ],
});
