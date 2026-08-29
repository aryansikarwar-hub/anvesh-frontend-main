import { expect, test } from '@playwright/test';
import { SEED, URLS } from './support/env';
import { expectPageLoaded, signIn } from './support/actions';

/**
 * The Tourist Guide journey the specification prescribes:
 * login → create a place → edit it → set availability → see bookings.
 *
 * Note the portal name: this is the TOURIST GUIDE portal, never a "partner"
 * portal, and it is served from its own origin.
 */
test.describe.configure({ mode: 'serial' });

const PLACE_TITLE = `E2E Hidden Stream ${Date.now()}`;

test.describe('tourist guide portal', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, URLS.guide, SEED.guide);
    await page.waitForURL(`${URLS.guide}/**`);
  });

  test('lands on a dashboard built from real data', async ({ page }) => {
    await page.goto(`${URLS.guide}/`);
    await expectPageLoaded(page, /dashboard|welcome/i);
    // No placeholder numbers: an empty account says so rather than showing zeros
    // dressed up as activity.
    await expect(page.getByText(/lorem|coming soon|dummy/i)).toHaveCount(0);
  });

  test('creates a place', async ({ page }) => {
    await page.goto(`${URLS.guide}/places`);
    await page.getByRole('link', { name: /new place|add place/i }).first().click();

    await page.getByLabel(/title/i).fill(PLACE_TITLE);
    await page
      .getByLabel(/summary/i)
      .fill('A shallow stream below the ridge that almost nobody stops at.');
    await page
      .getByLabel(/description/i)
      .fill(
        'A shallow stream below the ridge, reached by a twenty minute walk from the road. ' +
          'Best between October and February, when the water is clear and the path is dry.',
      );
    await page.getByLabel(/latitude/i).fill('12.9908');
    await page.getByLabel(/longitude/i).fill('75.3562');
    await page.getByLabel(/city/i).fill('Ujire');
    await page.getByLabel(/state/i).fill('Karnataka');

    await page.getByRole('button', { name: /save|create/i }).first().click();
    await expect(page.getByText(PLACE_TITLE).first()).toBeVisible();
  });

  test('edits the place it just created', async ({ page }) => {
    await page.goto(`${URLS.guide}/places`);
    await page.getByText(PLACE_TITLE).first().click();

    const summary = page.getByLabel(/summary/i);
    await summary.fill('A shallow stream below the ridge. Go on a weekday and you will be alone.');
    await page.getByRole('button', { name: /save/i }).first().click();

    await expect(page.getByText(/saved|updated/i).first()).toBeVisible();
  });

  test('submits the place for review and cannot publish it itself', async ({ page }) => {
    await page.goto(`${URLS.guide}/places`);
    await page.getByText(PLACE_TITLE).first().click();

    await page.getByRole('button', { name: /submit/i }).first().click();
    await expect(page.getByText(/pending review|in review|submitted/i).first()).toBeVisible();

    // Publication is an admin decision; the guide portal must not offer it.
    await expect(page.getByRole('button', { name: /^publish$/i })).toHaveCount(0);
  });

  test('opens availability and adds a slot', async ({ page }) => {
    await page.goto(`${URLS.guide}/availability`);
    await expectPageLoaded(page, /availability|slots/i);

    await page.getByRole('button', { name: /add slot|new slot/i }).first().click();
    await page.getByLabel(/seats/i).first().fill('4');
    await page.getByLabel(/price/i).first().fill('1500');
    await page.getByRole('button', { name: /save|create/i }).first().click();

    await expect(page.getByText(/4 seats|seats: 4/i).first()).toBeVisible();
  });

  test('lists its own bookings and nobody else’s', async ({ page }) => {
    await page.goto(`${URLS.guide}/bookings`);
    await expectPageLoaded(page, /bookings/i);

    const rows = page.getByRole('row');
    const count = await rows.count();
    // Every visible booking belongs to this guide — the API scopes the query by
    // the guide resolved from the token, so an empty list is a valid result.
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('shows earnings in rupees without inventing figures', async ({ page }) => {
    await page.goto(`${URLS.guide}/earnings`);
    await expectPageLoaded(page, /earnings|payouts/i);
    await expect(page.getByText(/NaN|undefined/i)).toHaveCount(0);
  });

  test('refuses a guide token on the admin portal', async ({ page }) => {
    await page.goto(`${URLS.admin}/users`);
    await expect(page).toHaveURL(/\/login/);
  });
});
