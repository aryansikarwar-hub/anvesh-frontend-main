'use client';

import { Link } from '@/admin/router';
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CreditCard,
  Flag,
  MapPinned,
  Receipt,
  Settings2,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  HeroBand,
  Money,
  Section,
  StatTile,
} from '@/ui';
import { useAdminDashboard, type AdminDashboard } from '@/admin/hooks/use-admin';
import { QueryBoundary } from '@/admin/components/query-boundary';
import { RequireAuth } from '@/admin/components/require-auth';

/**
 * The staff overview.
 *
 * Live counts and aggregates only. The queue tiles at the top are the ones
 * that mean somebody has to do something; everything below is context.
 */
export default function AdminDashboardPage() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}

function Dashboard() {
  const query = useAdminDashboard();

  return (
    <QueryBoundary
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      data={query.data}
      onRetry={() => void query.refetch()}
      skeleton="rows"
    >
      {({ dashboard }) => (
        <div className="flex flex-col gap-8">
          <HeroBand tone="dusk" className="rounded-[var(--radius-card)] px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                  Anvesh Admin
                </p>
                <h1 className="pt-2 text-2xl text-white sm:text-3xl">Platform overview</h1>
                <p className="pt-1.5 max-w-xl text-sm leading-relaxed text-white/80">
                  Live counts, read at the moment you loaded this page. Nothing here is cached
                  longer than the request that produced it.
                </p>
              </div>
              <Button asChild variant="onImage">
                <Link href="/system">System health</Link>
              </Button>
            </div>
          </HeroBand>

          <QueueBanner dashboard={dashboard} />

          <Section
            title="Needs attention"
            description="Work that is waiting on a person."
            action={
              <Button asChild variant="ghost" size="sm">
                <Link href="/places?status=PENDING_REVIEW">
                  Moderation queue
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile
                label="Places awaiting review"
                value={dashboard.moderation.placesPending}
                icon={<MapPinned className="size-4" />}
                tone={dashboard.moderation.placesPending > 0 ? 'attention' : 'neutral'}
                hint="Submitted by guides"
              />
              <StatTile
                label="Reported reviews"
                value={dashboard.moderation.reviewsReported}
                icon={<Flag className="size-4" />}
                tone={dashboard.moderation.reviewsReported > 0 ? 'attention' : 'neutral'}
                hint="Flagged by travellers"
              />
              <StatTile
                label="AI answers rejected"
                value={dashboard.ai.rejectedLast30Days}
                icon={<Brain className="size-4" />}
                hint={`of ${dashboard.ai.requestsLast30Days} requests, last 30 days`}
              />
              <StatTile
                label="Guardrail catch rate"
                value={
                  dashboard.ai.requestsLast30Days > 0
                    ? `${(
                        (dashboard.ai.rejectedLast30Days / dashboard.ai.requestsLast30Days) *
                        100
                      ).toFixed(1)}%`
                    : '—'
                }
                icon={<Sparkles className="size-4" />}
                hint="Answers thrown away for naming a place that does not exist"
              />
            </div>
          </Section>

          <Section title="Commerce, last 30 days" description="Counted from settled records.">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile
                label="Bookings created"
                value={dashboard.commerce.bookingsLast30Days}
                icon={<Receipt className="size-4" />}
              />
              <StatTile
                label="Confirmed"
                value={dashboard.commerce.confirmedLast30Days}
                icon={<Receipt className="size-4" />}
                tone="positive"
                hint={
                  dashboard.commerce.bookingsLast30Days > 0
                    ? `${(
                        (dashboard.commerce.confirmedLast30Days /
                          dashboard.commerce.bookingsLast30Days) *
                        100
                      ).toFixed(0)}% of those created`
                    : undefined
                }
              />
              <StatTile
                label="Gross value"
                value={<Money minor={dashboard.commerce.grossMinorLast30Days} />}
                icon={<CreditCard className="size-4" />}
              />
              <StatTile
                label="Platform commission"
                value={<Money minor={dashboard.commerce.commissionMinorLast30Days} />}
                icon={<CreditCard className="size-4" />}
                tone="positive"
              />
            </div>
          </Section>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardContent className="flex flex-col gap-3 pt-5">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <Users className="size-4 text-ink-faint" aria-hidden="true" />
                  People
                </h2>
                <dl className="flex flex-col gap-1.5 text-sm">
                  <Row label="Total accounts" value={dashboard.users.total} />
                  <Row label="Travellers" value={dashboard.users.travellers} />
                  <Row label="Tourist guides" value={dashboard.users.guides} />
                  <Row label="New in 30 days" value={dashboard.users.newLast30Days} />
                </dl>
                <div className="flex gap-2 pt-1">
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/users">Users</Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/guides">Guides</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-3 pt-5">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <MapPinned className="size-4 text-ink-faint" aria-hidden="true" />
                  Content
                </h2>
                <dl className="flex flex-col gap-1.5 text-sm">
                  <Row label="Places published" value={dashboard.content.published} />
                  <Row label="Places awaiting review" value={dashboard.content.pendingReview} />
                  <Row label="Places total" value={dashboard.content.places} />
                  <Row label="Experiences" value={dashboard.content.experiences} />
                </dl>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/places">Places</Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/stories">Stories</Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/reviews">Reviews</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="flex flex-col items-start gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Settings2 className="mt-0.5 size-5 shrink-0 text-laterite-500" aria-hidden="true" />
                <div>
                  <h2 className="text-base font-semibold">Ranking configuration</h2>
                  <p className="pt-1 max-w-xl text-sm leading-relaxed text-ink-muted">
                    Every discovery weight lives in the database, not in the code. Editing them here
                    changes what the whole product recommends — the change is versioned and audited.
                  </p>
                </div>
              </div>
              <Button asChild variant="secondary" className="shrink-0">
                <Link href="/recommendations">Open</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </QueryBoundary>
  );
}

/** Only shown when something is actually waiting. */
function QueueBanner({ dashboard }: { dashboard: AdminDashboard }) {
  const waiting = dashboard.moderation.placesPending + dashboard.moderation.reviewsReported;
  if (waiting === 0) return null;

  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-card)] bg-laterite-50 p-4 ring-1 ring-laterite-100">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-laterite-600" aria-hidden="true" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-ink">
          {waiting} item{waiting === 1 ? '' : 's'} waiting on a moderator
        </p>
        <p className="pt-1 text-sm text-ink-soft">
          {dashboard.moderation.placesPending} place
          {dashboard.moderation.placesPending === 1 ? '' : 's'} submitted,{' '}
          {dashboard.moderation.reviewsReported} review
          {dashboard.moderation.reviewsReported === 1 ? '' : 's'} reported. Guides are waiting on
          the first of those to go live.
        </p>
      </div>
      <Button asChild size="sm" className="shrink-0">
        <Link href="/places?status=PENDING_REVIEW">Review now</Link>
      </Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}