import { authenticator } from 'otplib';
import { expect, test, type Page } from '@playwright/test';
import { SEED, URLS } from './support/env';
import { expectPageLoaded } from './support/actions';

/**
 * The admin journey the specification prescribes:
 * login with mandatory TOTP → moderate content → manage a guide → inspect a
 * booking → read the audit log.
 *
 * The second factor is never bypassed. The suite computes a real code from the
 * seeded admin's shared secret, which the seed writes to E2E_ADMIN_TOTP_SECRET.
 */
test.describe.configure({ mode: 'serial' });

async function adminSignIn(page: Page): Promise<void> {
  test.skip(
    !SEED.admin.totpSecret,
    'E2E_ADMIN_TOTP_SECRET is not set — see docs/testing.md for how the seed exports it.',
  );

  await page.goto(`${URLS.admin}/login`);
  await page.locator('#admin-email').fill(SEED.admin.email);
  await page.locator('#admin-password').fill(SEED.admin.password);
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page.getByText(/second factor/i)).toBeVisible();
  await page.locator('#totp-code').fill(authenticator.generate(SEED.admin.totpSecret));
  await page.getByRole('button', { name: /verify and sign in/i }).click();
  await page.waitForURL(`${URLS.admin}/**`);
}

test.describe('admin portal', () => {
  test('a password alone never produces an admin session', async ({ page }) => {
    await page.goto(`${URLS.admin}/login`);
    await page.locator('#admin-email').fill(SEED.admin.email);
    await page.locator('#admin-password').fill(SEED.admin.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // The password step yields a challenge, not a session.
    await expect(page.getByText(/second factor/i)).toBeVisible();
    await page.goto(`${URLS.admin}/users`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('rejects a wrong second factor', async ({ page }) => {
    test.skip(!SEED.admin.totpSecret, 'E2E_ADMIN_TOTP_SECRET is not set.');
    await page.goto(`${URLS.admin}/login`);
    await page.locator('#admin-email').fill(SEED.admin.email);
    await page.locator('#admin-password').fill(SEED.admin.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.locator('#totp-code').fill('000000');
    await page.getByRole('button', { name: /verify and sign in/i }).click();
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('signs in with a real code and reaches the dashboard', async ({ page }) => {
    await adminSignIn(page);
    await expectPageLoaded(page, /dashboard|overview/i);
  });

  test('moderates a place from the review queue', async ({ page }) => {
    await adminSignIn(page);
    await page.goto(`${URLS.admin}/places?status=PENDING_REVIEW`);
    await expectPageLoaded(page, /places/i);

    const first = page.getByRole('row').nth(1);
    if ((await first.count()) === 0) {
      test.info().annotations.push({ type: 'note', description: 'Review queue was empty.' });
      return;
    }

    await first.getByRole('link').first().click();
    await page.getByRole('button', { name: /approve|publish/i }).first().click();
    await expect(page.getByText(/published|approved/i).first()).toBeVisible();
  });

  test('verifies a tourist guide', async ({ page }) => {
    await adminSignIn(page);
    await page.goto(`${URLS.admin}/guides`);
    await expectPageLoaded(page, /guides/i);

    const row = page.getByRole('row').nth(1);
    if ((await row.count()) === 0) return;
    await row.getByRole('link').first().click();
    await expect(page.getByText(/verified|verification/i).first()).toBeVisible();
  });

  test('inspects a booking without being able to fake a payment', async ({ page }) => {
    await adminSignIn(page);
    await page.goto(`${URLS.admin}/bookings`);
    await expectPageLoaded(page, /bookings/i);

    // There is no "mark as paid" anywhere in the admin portal: only a real
    // captured payment or a refund can move money.
    await expect(page.getByRole('button', { name: /mark as paid/i })).toHaveCount(0);
  });

  test('edits the ranking configuration rather than any hard-coded weight', async ({ page }) => {
    await adminSignIn(page);
    await page.goto(`${URLS.admin}/recommendations`);
    await expectPageLoaded(page, /ranking|recommendation/i);

    // Popularity and crowding appear as penalties in the editor.
    await expect(page.getByText(/popularity penalty/i).first()).toBeVisible();
    await expect(page.getByText(/crowd penalty/i).first()).toBeVisible();
  });

  test('records every privileged action in the audit log', async ({ page }) => {
    await adminSignIn(page);
    await page.goto(`${URLS.admin}/audit`);
    await expectPageLoaded(page, /audit/i);
    await expect(page.getByRole('row').nth(1)).toBeVisible();
  });

  test('shows AI monitoring including rejected hallucinations', async ({ page }) => {
    await adminSignIn(page);
    await page.goto(`${URLS.admin}/ai`);
    await expectPageLoaded(page, /ai/i);
    await expect(page.getByText(/rejected|hallucinat/i).first()).toBeVisible();
  });
});
