'use client';

import { PageShell, Section } from '@/ui';
import { useParams } from '@/user/router';
import { useDestination } from '@/user/hooks/use-content';
import { useSearch } from '@/user/hooks/use-discovery';
import { QueryBoundary } from '@/user/components/query-boundary';
import { PlaceGrid } from '@/user/components/place-grid';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DestinationPage() {
  const { slug } = useParams() as { slug: string };
  const query = useDestination(slug);
  const destinationId = query.data?.destination.id ?? '';
  const places = useSearch({ destinationId, limit: 12 }, Boolean(destinationId));

  return (
    <PageShell className="py-8">
      <QueryBoundary
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        data={query.data}
        onRetry={() => void query.refetch()}
        skeleton="rows"
      >
        {({ destination }) => (
          <div className="flex flex-col gap-10">
            <header className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-laterite-500">
                {destination.state}
              </span>
              <h1 className="text-3xl sm:text-4xl">{destination.name}</h1>
              <p className="max-w-3xl text-lg text-ink-soft">{destination.summary}</p>
              {destination.bestMonths.length ? (
                <p className="text-sm text-ink-muted">
                  Best months: {destination.bestMonths.map((m) => MONTHS[m - 1]).join(', ')}
                </p>
              ) : null}
            </header>

            <section className="max-w-3xl">
              <p className="whitespace-pre-line leading-relaxed text-ink-soft">
                {destination.description}
              </p>
            </section>

            <Section
              title={`Places in ${destination.name}`}
              description={`${destination.placeCount} published place${destination.placeCount === 1 ? '' : 's'}.`}
            >
              <QueryBoundary
                isLoading={places.isLoading}
                isError={places.isError}
                error={places.error}
                data={places.data}
                isEmpty={(data) => data.items.length === 0}
                onRetry={() => void places.refetch()}
                emptyTitle="No places here yet"
                emptyDescription="Nothing has been published for this destination."
              >
                {(data) => <PlaceGrid places={data.items} />}
              </QueryBoundary>
            </Section>
          </div>
        )}
      </QueryBoundary>
    </PageShell>
  );
}