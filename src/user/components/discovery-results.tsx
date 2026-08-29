'use client';

import { useState } from 'react';
import { PageHeader, Pagination } from '@/ui';
import { useSearch } from '@/user/hooks/use-discovery';
import { DEFAULT_FILTERS, DiscoveryFilters, type Filters } from './discovery-filters';
import { QueryBoundary } from './query-boundary';
import { PlaceGrid } from './place-grid';

export function DiscoveryResults({
  title,
  description,
  initial = {},
  lockedCategory,
}: {
  title: string;
  description: string;
  initial?: Partial<Filters>;
  lockedCategory?: string;
}) {
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS, ...initial });
  const [page, setPage] = useState(1);

  const query = useSearch({
    page,
    limit: 12,
    sort: filters.sort,
    ...(filters.q ? { q: filters.q } : {}),
    ...(lockedCategory ?? filters.categories
      ? { categories: lockedCategory ?? filters.categories }
      : {}),
    ...(filters.state ? { state: filters.state } : {}),
    ...(filters.ownership ? { ownership: filters.ownership } : {}),
    ...(filters.maxCrowd ? { maxCrowd: Number(filters.maxCrowd) } : {}),
    ...(filters.maxEntryFeeMinor ? { maxEntryFeeMinor: Number(filters.maxEntryFeeMinor) } : {}),
  });

  function update(next: Partial<Filters>) {
    setFilters((current) => ({ ...current, ...next }));
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-7">
      <PageHeader title={title} description={description} eyebrow="Discover" />

      {lockedCategory ? null : (
        <DiscoveryFilters
          filters={filters}
          onChange={update}
          onReset={() => {
            setFilters(DEFAULT_FILTERS);
            setPage(1);
          }}
          className="rounded-[var(--radius-card)] bg-paper-raised p-4 shadow-soft ring-1 ring-line/70 sm:p-5"
        />
      )}

      <QueryBoundary
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        data={query.data}
        isEmpty={(data) => data.items.length === 0}
        onRetry={() => void query.refetch()}
        emptyTitle="No places match those filters"
        emptyDescription="Try widening the crowd level or clearing the category, or search a different state."
      >
        {(data) => (
          <div className="flex flex-col gap-6">
            <p className="text-sm text-ink-muted">
              <strong className="font-semibold text-ink">{data.pageInfo.total}</strong> place
              {data.pageInfo.total === 1 ? '' : 's'} matched
            </p>
            <PlaceGrid places={data.items} />
            <Pagination pageInfo={data.pageInfo} onPageChange={setPage} />
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}