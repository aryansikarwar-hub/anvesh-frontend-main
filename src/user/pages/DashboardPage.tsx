'use client';

import { Link } from '@/user/router';
import {
  Bookmark,
  CalendarHeart,
  Clock3,
  Compass,
  History,
  MapPin,
  Settings2,
  Sparkles,
  Ticket,
  type LucideIcon,
} from 'lucide-react';
import { Badge, LoadingState, Money, PageShell } from '@/ui';
import { type PublicUser } from '@/lib/types';
import { useFeed } from '@/user/hooks/use-discovery';
import { useBookings } from '@/user/hooks/use-commerce';
import { useSavedPlaces, useTrips } from '@/user/hooks/use-personal';
import { useCurrentUser } from '@/user/hooks/use-session';
import { RequireAuth } from '@/user/components/require-auth';
import { DashboardCard } from '@/user/components/dashboard-card';

/**
 * The traveller's home base after signing in, in Raahi's dashboard-card grid
 * shape. Every figure and every card on this page is a real record from the
 * API — trips, saved places, bookings and a feed ranked with your own stored
 * preferences. Nothing here is a sample: an empty section says so.
 */
export default function DashboardPage() {
  return (
    <PageShell className="py-10">
      <RequireAuth>
        <DashboardBody />
      </RequireAuth>
    </PageShell>
  );
}

function DashboardBody() {
  const { user } = useCurrentUser();
  const trips = useTrips({ page: 1 });
  const saved = useSavedPlaces({ page: 1 });
  const bookings = useBookings({ page: 1 });
  const feed = useFeed({ limit: 5 });

  if (!user) return <LoadingState rows={4} label="Loading your dashboard" />;

  const upcoming = (bookings.data?.items ?? [])
    .filter((booking) => new Date(booking.startAt).getTime() >= Date.now())
    .filter((booking) => booking.status === 'CONFIRMED' || booking.status === 'PENDING_PAYMENT')
    .sort((a, b) => a.startAt.localeCompare(b.startAt));

  const first = user.profile.displayName.split(' ')[0] ?? 'traveller';

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            {timeOfDayGreeting()}, {first} 👋
          </h1>
          <p className="mt-2 text-muted-foreground">
            {upcoming.length > 0
              ? `${upcoming.length} booking${upcoming.length === 1 ? '' : 's'} coming up`
              : 'Nothing booked right now'}
            {feed.data?.items.length ? `, and ${feed.data.items.length} places ranked for you.` : '.'}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-bold text-accent-foreground">
          <Sparkles className="size-3.5" aria-hidden="true" />
          {trips.data?.pageInfo.total ?? 0} trips · {saved.data?.pageInfo.total ?? 0} saved ·{' '}
          {bookings.data?.pageInfo.total ?? 0} bookings
        </span>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <DashboardCard title="Upcoming bookings" icon={CalendarHeart} actionLabel="All bookings" actionHref="/bookings">
          {bookings.isLoading ? (
            <LoadingState rows={2} />
          ) : upcoming.length ? (
            <div className="space-y-3">
              {upcoming.slice(0, 3).map((booking) => (
                <Link
                  key={booking.id}
                  href={`/bookings/${booking.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-paper p-3 transition-colors hover:bg-paper-sunk"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={booking.status === 'CONFIRMED' ? 'success' : 'warn'}>
                        {booking.status.replace(/_/g, ' ').toLowerCase()}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-sm font-bold tracking-tight">{booking.experienceTitle}</p>
                    <p className="text-xs text-ink-muted">
                      {formatWhen(booking.startAt)} ·{' '}
                      <Money minor={booking.amounts.totalMinor} className="font-semibold" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyRow icon={Ticket} text="Nothing booked yet." actionLabel="Find an experience" actionHref="/explore" />
          )}
        </DashboardCard>

        <DashboardCard
          title="Picked for you"
          icon={Sparkles}
          actionLabel="See all"
          actionHref="/explore"
        >
          {feed.isLoading ? (
            <LoadingState rows={2} />
          ) : feed.data?.items.length ? (
            <div className="space-y-1.5">
              {feed.data.items.map((place) => (
                <MiniPlaceRow key={place.id} href={`/places/${place.slug}`} title={place.title} meta={`${place.city} · ${place.categorySlugs[0]?.replace(/-/g, ' ') ?? 'place'}`} />
              ))}
            </div>
          ) : (
            <EmptyRow icon={Compass} text="No places published yet." actionLabel="Explore" actionHref="/explore" />
          )}
        </DashboardCard>

        <DashboardCard title="Saved places" icon={Bookmark} actionLabel="Manage" actionHref="/saved">
          {saved.data?.items.length ? (
            <div className="space-y-1.5">
              {saved.data.items.slice(0, 4).map((entry) => (
                <MiniPlaceRow
                  key={entry.id}
                  href={`/places/${entry.place.slug}`}
                  title={entry.place.title}
                  meta={entry.place.city}
                />
              ))}
            </div>
          ) : (
            <EmptyRow icon={Bookmark} text="Nothing saved yet." actionLabel="Explore places" actionHref="/explore" />
          )}
        </DashboardCard>

        <DashboardCard title="Your trips" icon={History} actionLabel="Plan another" actionHref="/planner">
          {trips.data?.items.length ? (
            <div className="space-y-1.5">
              {trips.data.items.slice(0, 4).map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl p-2 transition-colors hover:bg-paper-sunk"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold tracking-tight">{trip.title}</p>
                    <p className="text-xs text-ink-muted">
                      {trip.days.length} {trip.days.length === 1 ? 'day' : 'days'} ·{' '}
                      {trip.days.reduce((total, day) => total + day.activities.length, 0)} places
                    </p>
                  </div>
                  {trip.generatedByAi ? <Badge variant="warn">AI draft</Badge> : null}
                </Link>
              ))}
            </div>
          ) : (
            <EmptyRow icon={CalendarHeart} text="No trips yet." actionLabel="Open the planner" actionHref="/planner" />
          )}
        </DashboardCard>

        <DashboardCard title="Travel preferences" icon={Settings2} actionLabel="Edit" actionHref="/preferences">
          <TravelPreferences user={user} />
        </DashboardCard>
      </div>
    </div>
  );
}

function MiniPlaceRow({ href, title, meta }: { href: string; title: string; meta: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-paper-sunk">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-laterite-50 text-laterite-600">
        <MapPin className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold tracking-tight">{title}</p>
        <p className="text-xs text-ink-muted">{meta}</p>
      </div>
    </Link>
  );
}

function EmptyRow({
  icon: Icon,
  text,
  actionLabel,
  actionHref,
}: {
  icon: LucideIcon;
  text: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="flex flex-col items-start gap-2 py-2">
      <Icon className="size-5 text-ink-faint" aria-hidden="true" />
      <p className="text-sm text-ink-muted">{text}</p>
      <Link href={actionHref} className="text-xs font-bold text-laterite-600 hover:underline">
        {actionLabel}
      </Link>
    </div>
  );
}

function TravelPreferences({ user }: { user: PublicUser }) {
  const { preferences } = user;
  const crowdLabel =
    preferences.crowdTolerance <= 0.3
      ? 'avoids crowds'
      : preferences.crowdTolerance <= 0.6
        ? 'tolerates some crowd'
        : 'does not mind crowds';

  const traits = [
    ...preferences.interests,
    ...preferences.travelStyles,
    preferences.budgetBand.toLowerCase().replace(/_/g, ' '),
    crowdLabel,
    ...(preferences.prefersLocalOwned ? ['prefers locally owned'] : []),
  ].filter(Boolean);

  if (!traits.length) {
    return (
      <p className="text-sm text-ink-muted">
        You have not set any preferences yet, so the feed is ranked on quality and quietness
        alone.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {traits.map((trait) => (
          <span
            key={trait}
            className="rounded-full border border-line bg-paper-sunk px-3 py-1.5 text-xs font-semibold capitalize text-ink-soft"
          >
            {trait.replace(/-/g, ' ')}
          </span>
        ))}
      </div>
      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
        <Clock3 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        These feed the scorer directly — changing them changes what you see.
      </p>
    </>
  );
}

function timeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}