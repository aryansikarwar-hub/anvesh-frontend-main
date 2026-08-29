'use client';

import { Link } from '@/guide/router';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarRange,
  Eye,
  Lightbulb,
  MapPinned,
  Plus,
  Receipt,
  Star,
  Wallet,
} from 'lucide-react';
import {
  Badge,
  BarWeek,
  Button,
  Card,
  CardContent,
  HeroBand,
  LoadingState,
  Money,
  Section,
  StatTile,
  type BarDatum,
} from '@/ui';
import {
  useAnalytics,
  useDashboard,
  useGuideProfile,
  useGuideReviews,
  type GuideAnalytics,
  type GuideDashboard,
} from '@/guide/hooks/use-guide';
import { RequireAuth } from '@/guide/components/require-auth';

/**
 * The guide's home screen.
 *
 * Every number is counted from this guide's own records at request time. Where
 * a figure would have to be estimated it is not shown at all — there is no
 * "projected revenue" and no invented percentage change, because the API does
 * not compute one and inventing it here would be a lie the rest of the product
 * does not tell.
 */
export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardBody />
    </RequireAuth>
  );
}

function DashboardBody() {
  const dashboard = useDashboard();
  const analytics = useAnalytics();
  const profile = useGuideProfile();
  const reviews = useGuideReviews({ page: 1 });

  if (dashboard.isLoading || !dashboard.data) {
    return <LoadingState rows={4} label="Loading your dashboard" />;
  }

  const d = dashboard.data.dashboard;
  const a = analytics.data?.analytics;
  const guide = profile.data?.guide;

  return (
    <div className="flex flex-col gap-8">
      <HeroBand tone="ghat" className="rounded-[var(--radius-card)] px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
              Partner dashboard
            </p>
            <h1 className="pt-2 text-2xl text-white sm:text-3xl">
              {guide?.displayName ?? 'Your guide profile'}
            </h1>
            <p className="pt-1.5 text-sm text-white/80">
              {guide ? `${guide.baseCity}, ${guide.baseState}` : 'Set up your profile to get listed'}
              {guide?.specialities.length ? ` · ${guide.specialities.slice(0, 3).join(', ')}` : ''}
            </p>
            {guide?.verified ? (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-white/15 px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-white/25">
                <BadgeCheck className="size-3.5" aria-hidden="true" />
                Verified guide
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="onImage">
              <Link href="/experiences/new">
                <Plus aria-hidden="true" />
                Add experience
              </Link>
            </Button>
            <Button
              asChild
              className="bg-white/12 text-white ring-1 ring-white/30 backdrop-blur-sm hover:bg-white/20"
            >
              <Link href="/places/new">Add place</Link>
            </Button>
          </div>
        </div>
      </HeroBand>

      <Insight dashboard={d} analytics={a} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Profile views"
          value={a ? sumViews(a) : '—'}
          icon={<Eye className="size-4" />}
          hint={a ? `across your places, last ${a.windowDays} days` : 'loading'}
        />
        <StatTile
          label="Upcoming bookings"
          value={d.bookings.upcoming}
          icon={<Receipt className="size-4" />}
          tone={d.bookings.upcoming > 0 ? 'positive' : 'neutral'}
          hint={`${d.bookings.completed} completed so far`}
        />
        <StatTile
          label="Awaiting payment"
          value={d.bookings.pendingPayment}
          icon={<CalendarRange className="size-4" />}
          tone={d.bookings.pendingPayment > 0 ? 'attention' : 'neutral'}
          hint="Seats held until the hold expires"
        />
        <StatTile
          label="Net earnings"
          value={<Money minor={d.earnings.lifetimeNetMinor} />}
          icon={<Wallet className="size-4" />}
          tone="positive"
          hint="Lifetime, after platform commission"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card>
          <CardContent className="flex flex-col gap-4 pt-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg">Views this week</h2>
              <Button asChild variant="ghost" size="sm">
                <Link href="/analytics">
                  Full analytics
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
            {analytics.isLoading ? (
              <LoadingState rows={1} label="Loading analytics" />
            ) : a ? (
              <BarWeek
                data={weeklyViews(a)}
                caption="Place views counted from real interaction events"
                unit="Views"
              />
            ) : (
              <p className="text-sm text-ink-muted">Analytics are not available right now.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-5">
            <h2 className="text-lg">Your most viewed places</h2>
            {a?.places.length ? (
              <ol className="flex flex-col gap-3">
                {[...a.places]
                  .sort((x, y) => y.views - x.views)
                  .slice(0, 5)
                  .map((place) => (
                    <li key={place.id} className="flex items-baseline justify-between gap-3">
                      <span className="min-w-0 truncate text-sm">{place.title}</span>
                      <span className="shrink-0 text-xs tabular-nums text-ink-muted">
                        {place.views} views · {place.saves} saves
                      </span>
                    </li>
                  ))}
              </ol>
            ) : (
              <p className="text-sm text-ink-muted">
                No views recorded yet. Views are counted when a traveller opens one of your places.
              </p>
            )}
            {a && a.bookingsInWindow > 0 ? (
              <p className="border-t border-line pt-3 text-xs text-ink-muted">
                {a.bookingsInWindow} bookings in this window ·{' '}
                <strong className="font-semibold text-ink-soft">
                  {(a.viewToBookingRate * 100).toFixed(1)}%
                </strong>{' '}
                of views became bookings
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <CountCard
          icon={<MapPinned className="size-4" />}
          title="Places"
          href="/places"
          rows={[
            ['Published', d.places.published],
            ['Awaiting review', d.places.pendingReview],
            ['Total', d.places.total],
          ]}
        />
        <CountCard
          icon={<CalendarRange className="size-4" />}
          title="Experiences"
          href="/experiences"
          rows={[
            ['Published', d.experiences.published],
            ['Total', d.experiences.total],
          ]}
        />
        <CountCard
          icon={<CalendarRange className="size-4" />}
          title="Availability"
          href="/availability"
          rows={[
            ['Open slots (30 days)', d.slots.openNext30Days],
            ['Seats available', d.slots.seatsAvailable],
          ]}
        />
        <CountCard
          icon={<Star className="size-4" />}
          title="Reviews"
          href="/reviews"
          rows={[
            ['Total', d.reviews.total],
            ['Average rating', d.reviews.total > 0 ? d.reviews.ratingAvg.toFixed(1) : '—'],
          ]}
        />
      </div>

      <Section
        title="Latest reviews"
        description="Only travellers who completed a booking can leave one."
        action={
          <Button asChild variant="ghost" size="sm">
            <Link href="/reviews">
              All reviews
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        }
      >
        {reviews.data?.items.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.data.items.slice(0, 4).map((review) => (
              <Card key={review.id}>
                <CardContent className="flex flex-col gap-2 pt-5">
                  <div className="flex items-center gap-2">
                    <Badge variant="quiet">
                      <Star className="size-3 fill-gold-500 text-gold-500" aria-hidden="true" />
                      {review.rating}
                    </Badge>
                    <span className="text-sm font-semibold">{review.title}</span>
                  </div>
                  <p className="line-clamp-3 text-sm text-ink-muted">{review.body}</p>
                  <p className="text-xs text-ink-faint">— {review.authorName}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-5 text-sm text-ink-muted">
              No reviews yet. They arrive after a traveller completes a booking with you.
            </CardContent>
          </Card>
        )}
      </Section>

      <Card>
        <CardContent className="flex flex-col gap-2 pt-5 text-sm text-ink-muted">
          <p className="font-semibold text-ink">How Anvesh ranks your places</p>
          <p className="leading-relaxed">
            Discovery here penalises popularity and crowding. Keeping a place accurate, clearly
            locally owned and honestly described will do more for its position than volume ever
            will. Crowd level comes from traveller reviews, not from anything you can set.
          </p>
          <p className="pt-1">
            <Link
              href="/stories"
              className="inline-flex items-center gap-1.5 font-medium text-laterite-600 underline underline-offset-4"
            >
              <BookOpen className="size-4" aria-hidden="true" />
              Write a story about one of your places
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * One sentence about what the data actually says.
 *
 * Every branch below is a fact already on this page, phrased as the next thing
 * to do. It is deliberately not called an AI insight: nothing here is
 * generated, and pretending otherwise would be the kind of invented number the
 * rest of Anvesh refuses to show.
 */
function Insight({
  dashboard,
  analytics,
}: {
  dashboard: GuideDashboard;
  analytics: GuideAnalytics | undefined;
}) {
  const message = (() => {
    if (dashboard.places.pendingReview > 0) {
      return `${dashboard.places.pendingReview} of your places ${
        dashboard.places.pendingReview === 1 ? 'is' : 'are'
      } waiting on moderation. Nothing to do — a moderator will get to it, and you will be notified either way.`;
    }
    if (dashboard.places.published === 0) {
      return 'You have no published places yet. Add one you know well and submit it for review — that is what puts you into discovery.';
    }
    if (dashboard.slots.openNext30Days === 0 && dashboard.experiences.published > 0) {
      return 'Your experiences are published but there are no open slots in the next 30 days, so nobody can book them. Open your calendar.';
    }
    if (dashboard.bookings.pendingPayment > 0) {
      return `${dashboard.bookings.pendingPayment} booking${
        dashboard.bookings.pendingPayment === 1 ? '' : 's'
      } held seats without completing payment. Those seats are released automatically when the hold expires.`;
    }
    if (analytics && analytics.places.length > 0 && sumViews(analytics) === 0) {
      return `Your places are live but have had no views in the last ${analytics.windowDays} days. Quiet places start low here by design — a story about one of them is the fastest way in.`;
    }
    if (analytics && analytics.bookingsInWindow === 0 && sumViews(analytics) > 0) {
      return `People are finding your places (${sumViews(
        analytics,
      )} views) but not booking. Check that your experiences have slots at times travellers can actually make.`;
    }
    return 'Everything is published and open for booking. Keeping details accurate is what holds a place’s position here.';
  })();

  return (
    <div className="flex items-start gap-3 rounded-[var(--radius-card)] bg-gold-50 p-4 ring-1 ring-gold-300/50">
      <Lightbulb className="mt-0.5 size-5 shrink-0 text-gold-700" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold text-ink">What to look at next</p>
        <p className="pt-1 text-sm leading-relaxed text-ink-soft">{message}</p>
      </div>
    </div>
  );
}

function CountCard({
  icon,
  title,
  href,
  rows,
}: {
  icon: React.ReactNode;
  title: string;
  href: string;
  rows: Array<[string, React.ReactNode]>;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-5">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <span className="text-ink-faint" aria-hidden="true">
            {icon}
          </span>
          {title}
        </h2>
        <dl className="flex flex-col gap-1.5 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="text-ink-muted">{label}</dt>
              <dd className="font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <Button asChild variant="secondary" size="sm">
          <Link href={href}>Open</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function sumViews(analytics: GuideAnalytics): number {
  return analytics.places.reduce((total, place) => total + place.views, 0);
}

/**
 * The last seven days of PLACE_VIEW events, including the days with none.
 * `daily` only contains days that had activity, so the gaps are filled here
 * rather than letting the chart imply a shorter week.
 */
function weeklyViews(analytics: GuideAnalytics): BarDatum[] {
  const counts = new Map<string, number>();
  for (const row of analytics.daily) {
    if (row.type !== 'PLACE_VIEW') continue;
    counts.set(row.day, (counts.get(row.day) ?? 0) + row.count);
  }

  const days: BarDatum[] = [];
  const today = new Date();
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const iso = date.toISOString().slice(0, 10);
    days.push({
      label: date.toLocaleDateString('en-IN', { weekday: 'narrow' }),
      fullLabel: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      value: counts.get(iso) ?? 0,
    });
  }
  return days;
}