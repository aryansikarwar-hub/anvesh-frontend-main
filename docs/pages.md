# Page Inventory (planned)

Rule (§15 / §39): a page ships only when a real API backs it. Pages are listed with the
endpoints they consume. Anything without an endpoint is not linked in navigation.
This file is updated at the end of every phase so it always matches reality.

## frontend/src/user — Traveller (mounted at `/`)

| Route | Purpose | API |
|---|---|---|
| `/` | Home: personalised feed, hidden gems, destinations | `GET /discovery/feed`, `/discovery/hidden-gems`, `/destinations` |
| `/explore` | Faceted explore with filters | `GET /discovery/search` |
| `/search` | Search results | `GET /discovery/search` |
| `/map` | Map discovery (MapLibre + Ola tiles) | `GET /discovery/map`, `/discovery/nearby` |
| `/places/:slug` | Place detail | `GET /places/:slug`, `/reviews`, `/discovery/nearby` |
| `/experiences/:slug` | Experience detail + slots | `GET /experiences/:slug`, `/availability` |
| `/guides/:slug` | Public guide profile | `GET /guides/:slug` |
| `/destinations/:slug` | Destination detail | `GET /destinations/:slug` |
| `/categories/:slug` | Category results | `GET /discovery/search?category=` |
| `/ai` | AI assistant — natural-language place discovery | `POST /ai/discover` |
| `/planner` | AI trip planner: day-by-day itinerary + your trips | `POST /ai/itinerary`, `GET /trips` |
| `/dashboard` | Signed-in home: greeting, upcoming bookings, ranked feed, trips, saved, preferences | `GET /trips`, `/users/me/saved`, `/bookings`, `/discovery/feed` |
| `/stories` | Local stories, filterable by kind | `GET /stories` |
| `/stories/:slug` | One story with the places it is about | `GET /stories/:slug` |
| `/partner` | "For locals" — what the guide portal offers | — (static; links to `/guide`) |
| `/trips` · `/trips/:id` | Trip planner + itinerary | `GET/POST/PATCH/DELETE /trips` |
| `/saved` | Saved places | `GET /users/me/saved` |
| `/collections` · `/collections/:id` | Wishlists | `/users/me/collections` |
| `/bookings` · `/bookings/:id` | Bookings | `GET /bookings`, `/bookings/:id` |
| `/checkout/:bookingId` | Razorpay checkout | `POST /payments/order`, `/payments/verify` |
| `/payments/:bookingId/status` | Payment result | `GET /payments/by-booking/:id` |
| `/reviews/mine` | My reviews | `GET /reviews/mine` |
| `/notifications` | Notification feed | `GET /notifications` |
| `/profile` · `/preferences` | Account | `GET/PATCH /users/me`, `/users/me/preferences` |
| `/login` `/register` `/forgot-password` `/reset-password` `/verify-email` | Auth | `/auth/*` |
| `not-found` · `error` | 404 / error boundary | — |

## frontend/src/guide — Tourist Guide (mounted at `/guide`)

Routes below are written relative to the portal, as the code writes them.
The real URL is the same path with `/guide` in front — `/places` is `/guide/places`.

| Route | Purpose | API |
|---|---|---|
| `/` | Dashboard KPIs (real aggregates) | `GET /guides/me/dashboard` |
| `/profile` · `/profile/edit` | Guide profile | `GET/PATCH /guides/me` |
| `/places` · `/places/new` · `/places/:id` · `/places/:id/edit` | Own places | `/guides/me/places*` |
| `/experiences` · `/experiences/new` · `/experiences/:id` · `/experiences/:id/edit` | Own experiences | `/guides/me/experiences*` |
| `/availability` · `/availability/slots` | Calendar + slot management | `/guides/me/availability*` |
| `/stories` · `/stories/new` · `/stories/:id` | Write and edit local stories | `/guides/me/stories*` |
| `/bookings` · `/bookings/:id` | Booking management | `/guides/me/bookings*` |
| `/earnings` · `/payouts` | Earnings + payout details | `/guides/me/earnings`, `/guides/me/payout` |
| `/reviews` | Reviews on own listings | `/guides/me/reviews` |
| `/analytics` | Views/saves/conversion | `/guides/me/analytics` |
| `/notifications` · `/settings` | — | `/notifications`, `/users/me` |
| `/login` `/forgot-password` `/reset-password` | Auth (portal `TOURIST_GUIDE`) | `/auth/*` |

**Not shipped in v1:** guide↔traveller chat (§16 item 20) — listed in the prompt as
"if implemented"; no messaging backend is in scope, so no chat UI is rendered.

## frontend/src/admin — Admin (mounted at `/admin`)

As above, relative to the portal: `/users` is really `/admin/users`.

Story moderation lives at `/stories` (`GET /admin/stories`,
`POST /admin/stories/:id/moderate`) and follows the same
submit-then-publish gate as places.

| Route | Purpose | API |
|---|---|---|
| `/login` · `/login/totp` | Invite-only login + mandatory TOTP | `/admin-auth/*` |
| `/` | Dashboard | `GET /admin/dashboard` |
| `/users` · `/users/:id` | Users | `/admin/users*` |
| `/guides` · `/guides/:id` | Tourist guides + verification | `/admin/guides*` |
| `/places` · `/places/:id` | Places + moderation | `/admin/places*` |
| `/experiences` · `/experiences/:id` | Experiences + moderation | `/admin/experiences*` |
| `/reviews` | Review moderation | `/admin/reviews*` |
| `/bookings` · `/payments` · `/refunds` | Commerce | `/admin/bookings`, `/admin/payments` |
| `/reports` · `/complaints` | User reports | `/admin/reports*` |
| `/recommendations` | Ranking weight configuration | `/admin/recommendation-config` |
| `/ai` | AI monitoring (requests, rejections, cost) | `/admin/ai/*` |
| `/analytics` | Platform analytics | `/admin/analytics` |
| `/audit` | Audit log | `/admin/audit-logs` |
| `/system` | System health | `/admin/system/health` |
| `/invites` · `/profile` · `/settings` | Admin admin | `/admin/invites`, `/users/me` |
