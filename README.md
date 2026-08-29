# Anvesh — Frontend

**Discover the places maps don't tell you about.**

A local-first travel discovery platform for India, built around one inverted
idea: **popularity is a penalty, not a boost.** Most travel products rank by
what everyone already visits. Anvesh ranks *against* it — the more popular and
the more crowded a place is, the lower it scores — so what surfaces is the
quiet waterfall two valleys over, not the one with a car park.

This folder is the web app: **Next.js 15 (App Router) + TypeScript**, all
three portals (traveller, tourist guide, admin) in one deployable app. It
talks to the API in the sibling `backend/` folder (a separate deployable
service; see its own README) over `NEXT_PUBLIC_API_BASE_URL`.

See [`docs/nextjs-migration.md`](./docs/nextjs-migration.md) for what changed
in the move from the earlier Vite + react-router-dom version.

---

## Start here

```bash
cp .env.example .env.local
npm install
npm run dev                   # http://localhost:3000
```

`NEXT_PUBLIC_API_BASE_URL` in `.env.local` must point at a running instance of
the `backend/` API (defaults to `http://localhost:4000/api/v1`). See
[`docs/setup.md`](./docs/setup.md) for the full local-development walkthrough.

| Where | URL |
| --- | --- |
| Traveller site | http://localhost:3000 |
| Tourist Guide portal | http://localhost:3000/guide |
| Admin portal | http://localhost:3000/admin |

Seed accounts (created by `npm run db:seed` in `backend/`) all use the
password `Anvesh@Dev2026`: `aarav.mehta@example.in` (traveller),
`shreya.kodagu@example.in` (guide), `root@anvesh.travel` (super admin —
enrols TOTP on first sign-in).

---

## Read this before anything else

### What is stubbed, and where

The frontend renders exactly what the API returns — there is no mock data and
no fake dashboard number anywhere in this codebase. What the API itself
simulates without a provider key (AI, payments, maps, email) is documented in
[`backend/README.md`](../backend/README.md) and surfaced honestly in the UI —
for example, `/ai` and the AI chat widget show a visible "running on the
local fallback provider" notice when `GEMINI_API_KEY` is unset, instead of
pretending to be the real thing.

### What has and has not been run

This app was built and converted inside a sandbox with no package-registry
access, so `npm install` and a real `next build` could not be run here. Every
`.ts`/`.tsx` file was checked for syntax correctness and every import path,
route path and component prop shape was checked by hand — see
[`docs/nextjs-migration.md`](./docs/nextjs-migration.md) for exactly how, and
run `npm install && npm run build` locally as the final check. See
[`TODO.md`](./TODO.md) for the full, honest breakdown across the whole
project.

---

## Three portals, one app

| Portal | Sign in at | Role | Dashboard shows |
| --- | --- | --- | --- |
| **User / Traveller** | `/login` | `TRAVELLER` | Upcoming bookings, a feed ranked with your preferences, your trips, saved places, and the preferences the ranking actually reads |
| **Tourist Guide** | `/guide/login` | `TOURIST_GUIDE` | Views this week, bookings, seats open, net earnings, your most-viewed places, latest reviews, and what to look at next |
| **Admin** | `/admin/login` | `MODERATOR` / `ADMIN` / `SUPER_ADMIN` | Moderation queues, commerce for the last 30 days, AI guardrail catch rate, people and content counts |

They share a bundle, not a session. Each portal has **its own sign-in page**
(`/login`, `/guide/login`, `/admin/login`), its own token, and its own React
Query cache — signing in as a traveller does not sign you in as a guide.

---

## What is in it

**For travellers** — a ranked discovery feed and faceted explore (category,
budget, crowd, ownership, sort), map discovery, place and experience detail,
an AI assistant (page + floating chat widget) that answers in real database
records, an AI trip planner that writes a day-by-day itinerary and can save
it as an editable trip, saved places and collections, booking and Razorpay
checkout, reviews, notifications, local stories, and a dashboard that pulls
all of it together.

**For guides** — a partner dashboard with views, bookings, seats and earnings;
places and experiences with a submit-for-review flow; a calendar with bulk slot
creation; booking management; earnings and payout details; reviews; and local
stories they write themselves.

**For staff** — moderation queues for places, experiences, stories, reviews and
reports; user and guide administration; bookings, payments and refunds; the
ranking configuration editor; AI monitoring; the audit log; and system health.

---

## Stack

| Layer | Choice |
| --- | --- |
| Tooling | npm, Node 20+, TypeScript 5.9 strict |
| Framework | Next.js 15 (App Router) + React 19 |
| Design | One design system in `src/ui`: near-white surfaces, charcoal type, a forest-green primary and terracotta accent (Raahi re-theme), Radix UI, shadow-defined cards |
| Routing | Filesystem routing under `app/`, thin `page.tsx` wrappers around `src/*/pages`; each portal keeps a `router.tsx` shim (`Link`, `useRouter`, `usePathname`, `useSearchParams`, `useParams`) so pages write portal-relative paths |
| Data | TanStack Query for all server state, Zustand for client-only state (session, map) |
| Styling | Tailwind CSS 4 via `@tailwindcss/postcss`, Radix UI, Framer Motion, MapLibre GL |

```
app/          Next.js App Router: (traveller)/, guide/, admin/ route groups
src/          Real screens, hooks, design system, domain types
public/       Static assets
e2e/          Playwright specs for the three journeys (needs backend running)
docs/         nextjs-migration, pages, plus shared: architecture, setup,
              deployment, testing, security, spec, spec-conflicts
scripts/      check-secrets
```

---

## Commands

```bash
npm run dev              # next dev, port 3000
npm run build            # typecheck + production build
npm start                # next start (serve the production build)
npm run typecheck
npm run lint
npm run check:secrets    # fail if anything that looks like a real credential is committed
```

End-to-end (`cd e2e`, needs the whole stack — this app and the `backend/`
API — running):

```bash
npm install && npx playwright install
npm run test:e2e
```

---

## Documentation

| File | What it covers |
| --- | --- |
| [`docs/nextjs-migration.md`](./docs/nextjs-migration.md) | What changed converting this app from Vite + react-router-dom to Next.js |
| [`docs/pages.md`](./docs/pages.md) | Page inventory per portal and the API each page consumes |
| [`docs/setup.md`](./docs/setup.md) | Local development from a clean machine |
| [`docs/architecture.md`](./docs/architecture.md) | Module boundaries, request lifecycle, background jobs |
| [`docs/security.md`](./docs/security.md) | Auth, the three authorization layers, rate limiting, injection defence |
| [`docs/testing.md`](./docs/testing.md) | How to run every suite, including what needs what |
| [`docs/deployment.md`](./docs/deployment.md) | Production topology, env vars, rollout |
| [`docs/spec.md`](./docs/spec.md) | The product specification as built |
| [`docs/spec-conflicts.md`](./docs/spec-conflicts.md) | Every deviation from the brief, C1–C11 |
| [`TODO.md`](./TODO.md) | What is written but not yet executed |

---

## Licence

Unlicensed / private. India-focused, built for `anvesh.travel`.
