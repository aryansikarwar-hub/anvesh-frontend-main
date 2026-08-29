'use client';

import { Link } from '@/user/router';
import { Button, Section } from '@/ui';
import { useDestinations, useFeed, useHiddenGems } from '@/user/hooks/use-discovery';
import { QueryBoundary } from './query-boundary';
import { PlaceGrid } from './place-grid';

export function HomeFeed() {
  const feed = useFeed({ limit: 6 });
  const gems = useHiddenGems({ limit: 6 });
  const destinations = useDestinations();

  return (
    <div className="flex flex-col gap-14">
      <Section
        title="Chosen for you"
        description="Ranked on match, quality and how quiet a place still is."
        action={
          <Button asChild variant="ghost" size="sm">
            <Link href="/explore">See all</Link>
          </Button>
        }
      >
        <QueryBoundary
          isLoading={feed.isLoading}
          isError={feed.isError}
          error={feed.error}
          data={feed.data}
          isEmpty={(data) => data.items.length === 0}
          onRetry={() => void feed.refetch()}
          emptyTitle="No places published yet"
          emptyDescription="Once guides publish places, they appear here. Run the seed to populate a development database."
        >
          {(data) => <PlaceGrid places={data.items} />}
        </QueryBoundary>
      </Section>

      <Section
        title="Still under the radar"
        description="Low visitor numbers, high quality. These lose their place here as they get busier."
      >
        <QueryBoundary
          isLoading={gems.isLoading}
          isError={gems.isError}
          error={gems.error}
          data={gems.data}
          isEmpty={(data) => data.items.length === 0}
          onRetry={() => void gems.refetch()}
          emptyTitle="No hidden gems right now"
          emptyDescription="A place qualifies only while its popularity stays below the threshold set in the admin portal."
        >
          {(data) => <PlaceGrid places={data.items} />}
        </QueryBoundary>
      </Section>

      <Section title="Destinations" description="Regions worth more than a single stop.">
        <QueryBoundary
          isLoading={destinations.isLoading}
          isError={destinations.isError}
          error={destinations.error}
          data={destinations.data}
          isEmpty={(data) => data.destinations.length === 0}
          onRetry={() => void destinations.refetch()}
          emptyTitle="No destinations yet"
          emptyDescription="Destinations are curated regions. None have been published."
          skeleton="rows"
        >
          {(data) => (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {data.destinations.map((destination) => (
                <Link
                  key={destination.id}
                  href={`/destinations/${destination.slug}`}
                  className="rounded-[var(--radius-card)] border border-line bg-paper-raised p-4 transition-shadow hover:shadow-soft"
                >
                  <div className="font-display text-lg leading-tight">{destination.name}</div>
                  <div className="pt-1 text-xs text-ink-muted">{destination.state}</div>
                </Link>
              ))}
            </div>
          )}
        </QueryBoundary>
      </Section>
    </div>
  );
}