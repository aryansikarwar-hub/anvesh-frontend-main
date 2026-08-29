'use client';

import { useState } from 'react';
import { Link } from '@/user/router';
import { Trash2 } from 'lucide-react';
import { Button, Card, CardContent, PageHeader, PageShell, Pagination } from '@/ui';
import { useSavedPlaces } from '@/user/hooks/use-personal';
import { useUnsavePlace } from '@/user/hooks/use-discovery';
import { QueryBoundary } from '@/user/components/query-boundary';
import { RequireAuth } from '@/user/components/require-auth';

export default function SavedPage() {
  return (
    <PageShell className="flex flex-col gap-6 py-8">
      <PageHeader eyebrow="Yours" title="Saved places" description="Everything you starred." />
      <RequireAuth>
        <SavedList />
      </RequireAuth>
    </PageShell>
  );
}

function SavedList() {
  const [page, setPage] = useState(1);
  const saved = useSavedPlaces({ page });
  const unsave = useUnsavePlace();

  return (
    <QueryBoundary
      isLoading={saved.isLoading}
      isError={saved.isError}
      error={saved.error}
      data={saved.data}
      isEmpty={(data) => data.items.length === 0}
      onRetry={() => void saved.refetch()}
      emptyTitle="Nothing saved yet"
      emptyDescription="Star a place from anywhere in Anvesh and it lands here."
      emptyAction={
        <Button asChild>
          <Link href="/explore">Start exploring</Link>
        </Button>
      }
      skeleton="rows"
    >
      {(data) => (
        <div className="flex flex-col gap-3">
          {data.items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between gap-4 pt-5">
                <div>
                  <h2 className="text-base">
                    <Link href={`/places/${item.place.slug}`} className="hover:underline">
                      {item.place.title}
                    </Link>
                  </h2>
                  <p className="pt-0.5 text-sm text-ink-muted">{item.place.city}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${item.place.title} from saved`}
                  onClick={() => unsave.mutate(item.placeId)}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </CardContent>
            </Card>
          ))}
          <Pagination pageInfo={data.pageInfo} onPageChange={setPage} />
        </div>
      )}
    </QueryBoundary>
  );
}