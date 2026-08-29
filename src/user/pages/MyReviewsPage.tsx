'use client';

import { useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, PageHeader, PageShell, Pagination } from '@/ui';
import { useDeleteReview, useMyReviews } from '@/user/hooks/use-commerce';
import { QueryBoundary } from '@/user/components/query-boundary';
import { RequireAuth } from '@/user/components/require-auth';

export default function MyReviewsPage() {
  return (
    <PageShell className="flex flex-col gap-6 py-8">
      <PageHeader
        eyebrow="Yours"
        title="My reviews"
        description="Reviews can be edited for 14 days after posting."
      />
      <RequireAuth>
        <MyReviews />
      </RequireAuth>
    </PageShell>
  );
}

function MyReviews() {
  const [page, setPage] = useState(1);
  const reviews = useMyReviews(page);
  const remove = useDeleteReview();

  return (
    <QueryBoundary
      isLoading={reviews.isLoading}
      isError={reviews.isError}
      error={reviews.error}
      data={reviews.data}
      isEmpty={(data) => data.items.length === 0}
      onRetry={() => void reviews.refetch()}
      emptyTitle="You have not written a review yet"
      emptyDescription="Open a place you have visited and share what it was actually like."
      skeleton="rows"
    >
      {(data) => (
        <div className="flex flex-col gap-3">
          {data.items.map((review) => (
            <Card key={review.id}>
              <CardContent className="flex items-start justify-between gap-4 pt-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold">
                      <Star className="size-4 fill-gold-500 text-gold-500" aria-hidden="true" />
                      {review.rating}
                    </span>
                    <span className="font-medium">{review.title}</span>
                  </div>
                  <p className="pt-1 text-sm text-ink-soft">{review.body}</p>
                  <p className="pt-1 text-xs text-ink-faint">
                    {review.targetType.toLowerCase()} ·{' '}
                    {new Date(review.createdAt).toLocaleDateString('en-IN')} · {review.status.toLowerCase()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete review ${review.title}`}
                  onClick={() => remove.mutate(review.id)}
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