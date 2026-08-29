# Frontend: Vite → Next.js migration notes

The frontend was converted from a Vite + react-router-dom single-page app to
a **Next.js 15 (App Router) + TypeScript** app, across all three portals
(traveller, guide, admin). The backend (`backend/`) is unchanged — same
Express-style API, same MongoDB models, same routes.

## What actually changed

* **Routing**: `src/{user,guide,admin}/routes.tsx` (react-router-dom route
  tables) are gone. Routing is now filesystem-based under `frontend/app/`:
  `app/(traveller)/**` for the traveller portal (the `(traveller)` group
  doesn't add a URL segment, so it still mounts at `/`), `app/guide/**` for
  `/guide`, `app/admin/**` for `/admin`. Each route is a thin generated
  `page.tsx` that imports and renders the real page component from
  `src/*/pages/*.tsx` — the page components themselves barely changed.
* **Router shims**: `src/{user,guide,admin}/router.tsx` kept their exact
  public API (`Link`, `useRouter`, `usePathname`, `useSearchParams`,
  `useParams`, `BASE`, `withBase`, `stripBase`) but are now backed by
  `next/link` / `next/navigation` instead of `react-router-dom`. Nothing
  that imports from these three files needed to change.
* **Layouts**: `src/{user,guide,admin}/layout.tsx` now take a `children`
  prop instead of rendering react-router-dom's `<Outlet />`. Each is wrapped
  by a matching `app/**/layout.tsx` that Next actually treats as the route
  segment's layout.
* **Errors / 404s**: `src/app-error.tsx` (react-router-dom's `errorElement`)
  is replaced by `app/(traveller)/error.tsx`, `app/guide/error.tsx`,
  `app/admin/error.tsx` (Next's `error.tsx` convention). Each portal's
  existing `NotFoundPage` component is now wired through `not-found.tsx` in
  the same three route groups.
* **Page titles**: `src/components/page-title.tsx` used to read
  `handle.title` off the matched react-router-dom route via `useMatches()` —
  there's no equivalent in the App Router. It's now `useSetTitle(title,
  suffix)`, called directly from each generated `page.tsx`.
* **Env vars**: `VITE_*` → `NEXT_PUBLIC_*` in the three `lib/env.ts` files and
  in `.env.example` (Next only inlines browser-exposed vars with the
  `NEXT_PUBLIC_` prefix, the same rule Vite applied to `VITE_`).
* **Build tooling**: `vite.config.ts` and `index.html` are gone, replaced by
  `next.config.ts`. Tailwind v4 now hooks in via `@tailwindcss/postcss`
  (`postcss.config.mjs`) instead of `@tailwindcss/vite`. `package.json`
  scripts are `next dev` / `next build` / `next start`.
* **New**: a floating AI chat widget
  (`src/user/components/ai-chat-widget.tsx`), reachable from every traveller
  page via a bubble button. It is not a new backend integration — it drives
  the same `POST /ai/discover` endpoint the `/ai` page already used, so it
  inherits the same deterministic no-key fallback and the same
  degraded-provider notice.

Everything else — the domain pages, hooks, TanStack Query setup, Zustand
stores, the `src/ui` design system, the Raahi re-theme — is untouched by this
conversion.

## Running it

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev      # http://localhost:3000
npm run build    # tsc --noEmit, then next build
```

## Database seeding

Seeding cannot run without a real MongoDB instance, so it's still a step you
run yourself, unchanged from before:

```bash
cd backend
cp .env.example .env      # put your MongoDB connection string in it
npm install
npm run db:migrate        # create collections, indexes, validators
npm run db:seed           # 40 real Indian places and demo accounts
```

Seed accounts (password `Anvesh@Dev2026`): `aarav.mehta@example.in`
(traveller), `shreya.kodagu@example.in` (guide), `root@anvesh.travel`
(super admin).

## Turning on real AI answers

Without any setup, `/ai` and the new chat widget already work end-to-end —
they call the real `/ai/discover` and `/ai/status` endpoints against
`AI_PROVIDER=stub`, a deterministic provider that ranks and returns real
database records with `degraded: true`. To get Gemini-generated prose
instead, set in `backend/.env`:

```
AI_PROVIDER=gemini
GEMINI_API_KEY=your-key-here
```

## `"use client"`

Every component under `src/` was written for a client-only Vite SPA, so it
freely used hooks, TanStack Query, Zustand and the DOM with no directive
needed. The App Router defaults every file to a Server Component unless it
(or an ancestor already inside a client boundary) says otherwise, so every
`.tsx` file under `src/` now starts with `'use client';`. This is the correct
call here, not a workaround: nothing in this app is meant to render on the
server — every screen is behind auth, session state or live query data.

## A note on how this was verified

This conversion was written and reviewed in an offline sandbox with no
package-registry or MongoDB access, so it could not be verified with a real
`npm install` + `next build` + `next dev` here. Every new and changed
`.ts`/`.tsx` file (336 files) was checked with the TypeScript compiler for
syntax correctness (`transpileModule`, no type/module resolution), and every
import path, route path and component prop shape was checked by hand against
the original source. Please run `npm install && npm run build` locally as
the final check before deploying — that will catch anything a syntax-only
pass can't, such as a genuinely missing dependency version or a type error
across file boundaries.
