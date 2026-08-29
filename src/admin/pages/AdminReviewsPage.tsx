'use client';

import { useState } from 'react';
import { Badge, Button, PageHeader, Pagination, Select } from '@/ui';
import { type Review } from '@/lib/types';
import { useAdminReviews, useModerateReview } from '@/admin/hooks/use-admin';
import { QueryBoundary } from '@/admin/components/query-boundary';
import { RequireAuth } from '@/admin/components/require-auth';
import { DataTable } from '@/admin/components/data-table';

export default function AdminReviewsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Moderation"
        title="Reviews"
        description="Hide or remove abusive reviews. Ratings and crowd signals recompute from what remains published."
      />
      <RequireAuth>
        <ReviewQueue />
      </RequireAuth>
    </div>
  );
}

function ReviewQueue() {
  const [reportedOnly, setReportedOnly] = useState('true');
  const [page, setPage] = useState(1);
  const reviews = useAdminReviews({ page, reportedOnly });
  const moderate = useModerateReview();

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-xs">
        <label htmlFor="review-filter" className="text-sm font-medium text-ink-soft">
          Show
        </label>
        <Select
          id="review-filter"
          className="mt-1"
          value={reportedOnly}
          onChange={(event) => {
            setReportedOnly(event.target.value);
            setPage(1);
          }}
        >
          <option value="true">Reported only</option>
          <option value="false">All reviews</option>
        </Select>
      </div>

      <QueryBoundary
        isLoading={reviews.isLoading}
        isError={reviews.isError}
        error={reviews.error}
        data={reviews.data}
        isEmpty={(data) => data.items.length === 0}
        onRetry={() => void reviews.refetch()}
        emptyTitle="Nothing reported"
        emptyDescription="No reviews need attention right now."
        skeleton="rows"
      >
        {(data) => (
          <div className="flex flex-col gap-4">
            <DataTable<Review>
              caption="Reviews"
              rows={data.items}
              rowKey={(review) => review.id}
              columns={[
                {
                  key: 'review',
                  header: 'Review',
                  render: (review) => (
                    <div className="max-w-lg">
                      <p className="font-medium">
                        {review.rating}/5 · {review.title}
                      </p>
                      <p className="pt-1 text-xs text-ink-soft">{review.body}</p>
                      <p className="pt-1 text-xs text-ink-faint">
                        {review.authorName} · {new Date(review.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (review) => (
                    <Badge variant={review.status === 'PUBLISHED' ? 'success' : 'danger'}>
                      {review.status.toLowerCase()}
                    </Badge>
                  ),
                },
                {
                  key: 'actions',
                  header: 'Decision',
                  align: 'right',
                  render: (review) => (
                    <div className="flex justify-end gap-2">
                      {review.status !== 'HIDDEN' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={moderate.isPending}
                          onClick={() =>
                            moderate.mutate({ id: review.id, status: 'HIDDEN', note: 'Hidden by moderator' })
                          }
                        >
                          Hide
                        </Button>
                      ) : null}
                      {review.status !== 'REMOVED' ? (
                        <Button
                          size="sm"
                          variant="danger"
                          loading={moderate.isPending}
                          onClick={() =>
                            moderate.mutate({
                              id: review.id,
                              status: 'REMOVED',
                              note: 'Removed by moderator',
                            })
                          }
                        >
                          Remove
                        </Button>
                      ) : null}
                      {review.status !== 'PUBLISHED' ? (
                        <Button
                          size="sm"
                          loading={moderate.isPending}
                          onClick={() =>
                            moderate.mutate({ id: review.id, status: 'PUBLISHED', note: 'Restored' })
                          }
                        >
                          Restore
                        </Button>
                      ) : null}
                    </div>
                  ),
                },
              ]}
            />
            <Pagination pageInfo={data.pageInfo} onPageChange={setPage} />
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}