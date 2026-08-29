import { expect, test } from '@playwright/test';
import { SEED, URLS, uniqueEmail } from './support/env';
import {
  expectPageLoaded,
  hasMailCatcher,
  registerTraveller,
  signIn,
  verificationLinkFor,
} from './support/actions';

const PASSWORD = 'Traveller@2026';

/**
 * The traveller journey the specification prescribes:
 * register → login → search → view a place → save it → add it to a trip →
 * book an experience → reach checkout.
 *
 * Checkout stops at the point where Razorpay would take over. When the keys are
 * absent the API answers PAYMENT_PROVIDER_NOT_CONFIGURED and the page says so;
 * the suite asserts that honest state rather than pretending a payment
 * succeeded.
 */
test.describe.configure({ mode: 'serial' });

test.describe('traveller portal', () => {
  const email = uniqueEmail('e2e-traveller');

  test('registers and verifies an account', async ({ page }) => {
    test.skip(
      !(await hasMailCatcher()),
      'No mail catcher reachable. Run the backend with EMAIL_PROVIDER=smtp and a Mailpit-compatible server, or set E2E_MAILPIT_URL.',
    );
    await registerTraveller(page, { displayName: 'E2E Traveller', email, password: PASSWORD });

    const link = await verificationLinkFor(email);
    await page.goto(link);
    await expect(page.getByText(/verified|your email is confirmed/i)).toBeVisible();
  });

  test('signs in and lands on a personalised home feed', async ({ page }) => {
    await signIn(page, URLS.web, { email, password: PASSWORD });
    await page.waitForURL(`${URLS.web}/**`);
    await expectPageLoaded(page, /discover|anvesh|for you/i);
  });

  test('searches, filters and opens a place', async ({ page }) => {
    await signIn(page, URLS.web, { email, password: PASSWORD });

    await page.goto(`${URLS.web}/search?q=waterfall`);
    const cards = page.getByRole('article');
    await expect(cards.first()).toBeVisible();

    const title = await cards.first().getByRole('heading').first().innerText();
    await cards.first().getByRole('link').first().click();

    await page.waitForURL(/\/places\//);
    await expect(page.getByRole('heading', { name: title }).first()).toBeVisible();
    // Crowd level is shown because avoiding crowds is the point of the product.
    await expect(page.getByText(/crowd|quiet|busy/i).first()).toBeVisible();
  });

  test('saves a place and finds it again under Saved', async ({ page }) => {
    await signIn(page, URLS.web, { email, password: PASSWORD });
    await page.goto(`${URLS.web}/search?q=waterfall`);

    const card = page.getByRole('article').first();
    const title = await card.getByRole('heading').first().innerText();
    await card.getByRole('link').first().click();
    await page.waitForURL(/\/places\//);

    await page.getByRole('button', { name: /save/i }).first().click();
    await page.goto(`${URLS.web}/saved`);
    await expect(page.getByText(title).first()).toBeVisible();
  });

  test('creates a trip and adds a place to it', async ({ page }) => {
    await signIn(page, URLS.web, { email, password: PASSWORD });
    await page.goto(`${URLS.web}/trips`);

    await page.getByRole('button', { name: /new trip|create trip/i }).first().click();
    await page.getByLabel(/title|name/i).first().fill('Coorg in the rain');
    await page.getByRole('button', { name: /create|save/i }).first().click();

    await page.waitForURL(/\/trips\/[a-f0-9]{24}/);
    await expectPageLoaded(page, /coorg in the rain/i);
  });

  test('books an experience and reaches checkout', async ({ page }) => {
    await signIn(page, URLS.web, { email, password: PASSWORD });
    await page.goto(`${URLS.web}/explore`);

    await page.getByRole('link', { name: /experience/i }).first().click();
    await page.waitForURL(/\/experiences\//);

    // Pick the first bookable slot.
    await page.getByRole('button', { name: /select|choose|book/i }).first().click();
    await page.getByRole('button', { name: /^book|confirm|continue/i }).first().click();

    await page.waitForURL(/\/checkout\/[a-f0-9]{24}/);
    await expect(page.getByText(/₹/).first()).toBeVisible();

    await page.getByRole('button', { name: /pay|proceed/i }).first().click();

    // Either a real Razorpay handoff, or an explicit "not configured" message.
    await expect(
      page.getByText(/payments are not configured|razorpay|redirecting/i).first(),
    ).toBeVisible();
  });

  test('shows the booking in the traveller’s own list', async ({ page }) => {
    await signIn(page, URLS.web, { email, password: PASSWORD });
    await page.goto(`${URLS.web}/bookings`);
    await expect(page.getByText(/pending payment|awaiting payment/i).first()).toBeVisible();
  });

  test('does not let a traveller reach the guide or admin portal', async ({ page }) => {
    await signIn(page, URLS.web, { email, password: PASSWORD });

    await page.goto(`${URLS.guide}/dashboard`);
    await expect(page).toHaveURL(/\/login/);

    await page.goto(`${URLS.admin}/dashboard`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('keeps an unverified account out of booking', async ({ page }) => {
    const fresh = uniqueEmail('e2e-unverified');
    await registerTraveller(page, {
      displayName: 'Unverified Traveller',
      email: fresh,
      password: PASSWORD,
    });
    await signIn(page, URLS.web, { email: fresh, password: PASSWORD });

    await page.goto(`${URLS.web}/explore`);
    await page.getByRole('link', { name: /experience/i }).first().click();
    await page.waitForURL(/\/experiences\//);
    await page.getByRole('button', { name: /select|choose|book/i }).first().click();
    await page.getByRole('button', { name: /^book|confirm|continue/i }).first().click();

    await expect(page.getByText(/verify your email/i).first()).toBeVisible();
  });

  test('the seeded traveller can sign in too', async ({ page }) => {
    await signIn(page, URLS.web, SEED.traveller);
    await page.waitForURL(`${URLS.web}/**`);
    await expect(page.getByRole('link', { name: /saved places/i })).toBeVisible();
  });
});
