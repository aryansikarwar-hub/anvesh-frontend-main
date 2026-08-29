'use client';

import { useState } from 'react';
import { Link } from '@/guide/router';
import { Plus, Send, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, PageHeader, Pagination } from '@/ui';
import { useMyPlaces, usePlaceMutations } from '@/guide/hooks/use-guide';
import { QueryBoundary } from '@/guide/components/query-boundary';
import { RequireAuth } from '@/guide/components/require-auth';
import { ContentStatusBadge } from '@/guide/components/status-badge';

export default function GuidePlacesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Content"
        title="My places"
        description="Places you added. A moderator publishes them; you cannot publish your own."
        actions={
          <Button asChild>
            <Link href="/places/new">
              <Plus aria-hidden="true" />
              Add a place
            </Link>
          </Button>
        }
      />
      <RequireAuth>
        <PlacesList />
      </RequireAuth>
    </div>
  );
}

function PlacesList() {
  const [page, setPage] = useState(1);
  const places = useMyPlaces({ page });
  const mutations = usePlaceMutations();

  return (
    <QueryBoundary
      isLoading={places.isLoading}
      isError={places.isError}
      error={places.error}
      data={places.data}
      isEmpty={(data) => data.items.length === 0}
      onRetry={() => void places.refetch()}
      emptyTitle="You have not added a place yet"
      emptyDescription="Add somewhere you know well. Describe it honestly — accuracy is what Anvesh ranks on."
      emptyAction={
        <Button asChild>
          <Link href="/places/new">Add your first place</Link>
        </Button>
      }
      skeleton="rows"
    >
      {(data) => (
        <div className="flex flex-col gap-3">
          {data.items.map((place) => (
            <Card key={place.id}>
              <CardContent className="flex flex-wrap items-start justify-between gap-4 pt-5">
                <div>
                  <ContentStatusBadge status={place.status} />
                  <h2 className="pt-1.5 text-lg">
                    <Link href={`/places/${place.id}`} className="hover:underline">
                      {place.title}
                    </Link>
                  </h2>
                  <p className="pt-0.5 text-sm text-ink-muted">
                    {place.address.city}, {place.address.state} · {place.categorySlugs.join(', ')}
                  </p>
                  <p className="pt-0.5 text-xs text-ink-faint">
                    {place.signals.viewCount} views · {place.signals.saveCount} saves ·{' '}
                    {place.images.length} photograph{place.images.length === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/places/${place.id}/edit`}>Edit</Link>
                  </Button>
                  {place.status === 'DRAFT' || place.status === 'REJECTED' ? (
                    <Button
                      size="sm"
                      loading={mutations.submit.isPending}
                      onClick={() => mutations.submit.mutate(place.id)}
                    >
                      <Send aria-hidden="true" />
                      Submit
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${place.title}`}
                    onClick={() => mutations.remove.mutate(place.id)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Pagination pageInfo={data.pageInfo} onPageChange={setPage} />
        </div>
      )}
    </QueryBoundary>
  );
}