/**
 * Where the app and the API live during an end-to-end run.
 * Overridable so the same suite can run against a deployed build.
 */
const WEB = process.env.E2E_WEB_URL ?? 'http://localhost:3000';

/**
 * The three portals are route prefixes inside one React app now, not three
 * deployments, so they share a host.
 */
export const URLS = {
  web: WEB,
  guide: process.env.E2E_GUIDE_URL ?? `${WEB}/guide`,
  admin: process.env.E2E_ADMIN_URL ?? `${WEB}/admin`,
  api: process.env.E2E_API_URL ?? 'http://localhost:4000/api/v1',
} as const;

/**
 * Accounts created by `npm run db:seed` in backend/, matching
 * backend/src/lib/database/seed/data/users.ts.
 * The seeder refuses to run when NODE_ENV=production, so these credentials
 * only ever exist on a development database.
 */
export const SEED = {
  traveller: {
    email: process.env.E2E_TRAVELLER_EMAIL ?? 'aarav.mehta@example.in',
    password: process.env.E2E_TRAVELLER_PASSWORD ?? 'Anvesh@Dev2026',
  },
  guide: {
    email: process.env.E2E_GUIDE_EMAIL ?? 'shreya.kodagu@example.in',
    password: process.env.E2E_GUIDE_PASSWORD ?? 'Anvesh@Dev2026',
  },
  admin: {
    email: process.env.E2E_ADMIN_EMAIL ?? 'root@anvesh.travel',
    password: process.env.E2E_ADMIN_PASSWORD ?? 'Anvesh@Dev2026',
    /**
     * Admin sign-in requires TOTP and the seed never fabricates a secret — the
     * first sign-in enrols one. Complete that enrolment once by hand, put the
     * resulting base32 secret in E2E_ADMIN_TOTP_SECRET, and the admin specs
     * compute real codes from it. Without it those specs skip rather than
     * pretending the second factor was satisfied.
     */
    totpSecret: process.env.E2E_ADMIN_TOTP_SECRET ?? '',
  },
} as const;

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10_000)}@example.in`;
}
