import { expect, type Page } from '@playwright/test';
import { URLS } from './env';

/** Signs in on whichever portal the page is currently pointed at. */
export async function signIn(
  page: Page,
  origin: string,
  credentials: { email: string; password: string },
): Promise<void> {
  await page.goto(`${origin}/login`);
  await page.locator('#login-email').fill(credentials.email);
  await page.locator('#login-password').fill(credentials.password);
  await page.getByRole('button', { name: /sign in/i }).click();
}

export async function registerTraveller(
  page: Page,
  input: { displayName: string; email: string; password: string },
): Promise<void> {
  await page.goto(`${URLS.web}/register`);
  await page.locator('#register-name').fill(input.displayName);
  await page.locator('#register-email').fill(input.email);
  await page.locator('#register-password').fill(input.password);
  await page.getByRole('button', { name: /create account/i }).click();
  await expect(page.getByText(/check your email/i)).toBeVisible();
}

/**
 * Reads the verification link out of a mail catcher rather than out of the
 * database, so the email really has to have been sent.
 *
 * This needs the backend running with EMAIL_PROVIDER=smtp and something
 * listening on SMTP_PORT that exposes Mailpit's HTTP API. With the default
 * EMAIL_PROVIDER=console no mail is sent anywhere and the specs that call
 * this should be skipped — see `hasMailCatcher()` below.
 */
export async function verificationLinkFor(email: string): Promise<string> {
  const mailpit = process.env.E2E_MAILPIT_URL ?? 'http://localhost:8025';
  const response = await fetch(`${mailpit}/api/v1/search?query=to:${encodeURIComponent(email)}`);
  if (!response.ok) throw new Error(`Mailpit search failed with ${response.status}`);
  const found = (await response.json()) as { messages: Array<{ ID: string }> };
  const first = found.messages[0];
  if (!first) throw new Error(`No verification email was delivered to ${email}`);

  const message = await fetch(`${mailpit}/api/v1/message/${first.ID}`);
  const detail = (await message.json()) as { Text?: string; HTML?: string };
  const body = `${detail.Text ?? ''}\n${detail.HTML ?? ''}`;
  const match = body.match(/https?:\/\/[^\s"'<>]*verify-email[^\s"'<>]*/);
  if (!match) throw new Error(`No verification link found in the email to ${email}`);
  return match[0];
}

/** Asserts that the page is not showing an error boundary or an empty shell. */
export async function expectPageLoaded(page: Page, heading: RegExp): Promise<void> {
  await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
  await expect(page.getByText(/something went wrong/i)).toHaveCount(0);
}

/** True when a mail catcher is reachable, so mail-dependent specs can skip. */
export async function hasMailCatcher(): Promise<boolean> {
  const mailpit = process.env.E2E_MAILPIT_URL ?? 'http://localhost:8025';
  try {
    const response = await fetch(`${mailpit}/api/v1/messages?limit=1`, {
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
