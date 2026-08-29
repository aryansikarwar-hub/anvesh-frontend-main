'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Badge, Card, CardContent, PageHeader, Pagination } from '@/ui';
import { useGuideReviews } from '@/guide/hooks/use-guide';
import { QueryBoundary } from '@/guide/components/query-boundary';
import { RequireAuth } from '@/guide/components/require-auth';

export default function GuideReviewsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Feedback"
        title="Reviews"
        description="What travellers wrote about your experiences. You cannot edit or remove them; report anything abusive and a moderator will look."
      />
      <RequireAuth>
        <ReviewsList />
      </RequireAuth>
    </div>
  );
}

function ReviewsList() {
  const [page, setPage] = useState(1);
  const reviews = useGuideReviews({ page });

  return (
    <QueryBoundary
      isLoading={reviews.isLoading}
      isError={reviews.isError}
      error={reviews.error}
      data={reviews.data}
      isEmpty={(data) => data.items.length === 0}
      onRetry={() => void reviews.refetch()}
      emptyTitle="No reviews yet"
      emptyDescription="Only travellers who actually booked an experience can review it, so reviews start after your first completed booking."
      skeleton="rows"
    >
      {(data) => (
        <div className="flex flex-col gap-3">
          {data.items.map((review) => (
            <Card key={review.id}>
              <CardContent className="flex flex-col gap-2 pt-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold">
                    <Star className="size-4 fill-gold-500 text-gold-500" aria-hidden="true" />
                    {review.rating}
                  </span>
                  <span className="font-medium">{review.title}</span>
                  {review.crowdFelt !== null && review.crowdFelt >= 0.6 ? (
                    <Badge variant="warn">Felt crowded</Badge>
                  ) : null}
                </div>
                <p className="text-sm leading-relaxed text-ink-soft">{review.body}</p>
                <p className="text-xs text-ink-faint">
                  {review.authorName} · {new Date(review.createdAt).toLocaleDateString('en-IN')}
                </p>
              </CardContent>
            </Card>
          ))}
          <Pagination pageInfo={data.pageInfo} onPageChange={setPage} />
        </div>
      )}
    </QueryBoundary>
  );
}