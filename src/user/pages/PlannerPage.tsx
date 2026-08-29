'use client';

import { Link } from '@/user/router';
import { ArrowRight, CalendarRange } from 'lucide-react';
import { Button, Card, CardContent, EmptyState, PageHeader, PageShell, Section } from '@/ui';
import { useAiStatus } from '@/user/hooks/use-ai';
import { useTrips } from '@/user/hooks/use-personal';
import { useCurrentUser } from '@/user/hooks/use-session';
import { AiItineraryPanel } from '@/user/components/ai-itinerary';
import { ProviderNotice } from '@/user/pages/AiPage';

/**
 * The AI trip planner: build a day-by-day itinerary for a destination, and
 * pick up the trips you already have.
 *
 * The itinerary only ever contains places that exist and are published — the
 * server verifies every reference before this page sees it.
 */
export default function PlannerPage() {
  const status = useAiStatus();
  const { isAuthenticated } = useCurrentUser();
  const trips = useTrips({ page: 1 });
  const provider = status.data?.provider;

  return (
    <PageShell className="flex flex-col gap-8 py-8">
      <PageHeader
        eyebrow="AI Planner"
        title="Plan a trip, day by day"
        description="Pick a destination and a pace. Anvesh builds an itinerary from real places, avoids the crowded ones if you ask it to, and can save the result as a trip you can edit."
        actions={
          <Button asChild variant="secondary">
            <Link href="/trips">
              All trips
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      {provider ? <ProviderNotice provider={provider} /> : null}

      {isAuthenticated ? (
        <AiItineraryPanel />
      ) : (
        <Card>
          <CardContent className="pt-5 text-sm text-ink-muted">
            <Link href="/login?next=%2Fplanner" className="font-medium text-laterite-600 underline">
              Sign in
            </Link>{' '}
            to build an itinerary. Plans are saved to your account so you can edit them later.
          </CardContent>
        </Card>
      )}

      {isAuthenticated ? (
        <Section
          title="Your trips"
          description="Everything you have planned, whether the assistant built it or you did."
        >
          {trips.data?.items.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trips.data.items.slice(0, 6).map((trip) => (
                <Card key={trip.id} className="anvesh-rise">
                  <CardContent className="flex flex-col gap-2 pt-5">
                    <div className="flex items-center gap-2 text-xs text-ink-muted">
                      <CalendarRange className="size-3.5" aria-hidden="true" />
                      {trip.days.length} {trip.days.length === 1 ? 'day' : 'days'}
                    </div>
                    <h3 className="text-base font-semibold">
                      <Link href={`/trips/${trip.id}`} className="hover:underline">
                        {trip.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-ink-muted">
                      {trip.days.reduce((total, day) => total + day.activities.length, 0)} places
                      planned
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No trips yet"
              description="Build one above, or start from a place you have saved."
              action={
                <Button asChild variant="secondary">
                  <Link href="/explore">Explore places</Link>
                </Button>
              }
            />
          )}
        </Section>
      ) : null}
    </PageShell>
  );
}