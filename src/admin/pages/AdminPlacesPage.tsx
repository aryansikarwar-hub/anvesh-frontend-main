'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from '@/admin/router';
import { Badge, Button, LoadingState, PageHeader, Pagination, Select, Textarea } from '@/ui';
import { type ContentStatus, type Place } from '@/lib/types';
import { useAdminPlaces, useModeratePlace } from '@/admin/hooks/use-admin';
import { QueryBoundary } from '@/admin/components/query-boundary';
import { RequireAuth } from '@/admin/components/require-auth';
import { DataTable } from '@/admin/components/data-table';
import { describeError } from '@/admin/lib/api';

export default function AdminPlacesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Moderation"
        title="Places"
        description="Approve, reject or archive submissions. Every decision is written to the audit log."
      />
      <RequireAuth>
        <Suspense fallback={<LoadingState rows={4} />}>
          <PlacesQueue />
        </Suspense>
      </RequireAuth>
    </div>
  );
}

function PlacesQueue() {
  const params = useSearchParams();
  const [status, setStatus] = useState(params.get('status') ?? 'PENDING_REVIEW');
  const [page, setPage] = useState(1);
  const places = useAdminPlaces({ page, ...(status ? { status } : {}) });
  const moderate = useModeratePlace();
  const [reason, setReason] = useState('');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="max-w-xs flex-1">
          <label htmlFor="place-status" className="text-sm font-medium text-ink-soft">
            Status
          </label>
          <Select
            id="place-status"
            className="mt-1"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="PENDING_REVIEW">Awaiting review</option>
            <option value="PUBLISHED">Published</option>
            <option value="REJECTED">Rejected</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
        </div>
        <div className="min-w-64 flex-1">
          <label htmlFor="moderation-reason" className="text-sm font-medium text-ink-soft">
            Note sent to the guide
          </label>
          <Textarea
            id="moderation-reason"
            className="mt-1 min-h-10"
            maxLength={500}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Why this decision? The guide sees this."
          />
        </div>
      </div>

      {moderate.isError ? (
        <p role="alert" className="text-sm text-danger-500">
          {describeError(moderate.error).description}
        </p>
      ) : null}

      <QueryBoundary
        isLoading={places.isLoading}
        isError={places.isError}
        error={places.error}
        data={places.data}
        isEmpty={(data) => data.items.length === 0}
        onRetry={() => void places.refetch()}
        emptyTitle="Nothing in this queue"
        emptyDescription="No places match that status right now."
        skeleton="rows"
      >
        {(data) => (
          <div className="flex flex-col gap-4">
            <DataTable<Place>
              caption="Places awaiting moderation"
              rows={data.items}
              rowKey={(place) => place.id}
              columns={[
                {
                  key: 'title',
                  header: 'Place',
                  render: (place) => (
                    <div>
                      <p className="font-medium">{place.title}</p>
                      <p className="text-xs text-ink-muted">
                        {place.address.city}, {place.address.state} · {place.categorySlugs.join(', ')}
                      </p>
                      <p className="max-w-md pt-1 text-xs text-ink-faint">{place.summary}</p>
                    </div>
                  ),
                },
                {
                  key: 'guide',
                  header: 'Added by',
                  render: (place) => (
                    <span className="text-xs">
                      {place.guideSummary?.displayName ?? 'Platform'}
                      {place.guideSummary?.verified ? ' (verified)' : ''}
                    </span>
                  ),
                },
                {
                  key: 'signals',
                  header: 'Signals',
                  numeric: true,
                  render: (place) => (
                    <span className="text-xs">
                      quality {(place.signals.qualityScore * 100).toFixed(0)}% · crowd{' '}
                      {(place.signals.crowdLevel * 100).toFixed(0)}% · popularity{' '}
                      {(place.signals.popularityScore * 100).toFixed(0)}%
                    </span>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (place) => (
                    <Badge variant={place.status === 'PUBLISHED' ? 'success' : 'neutral'}>
                      {place.status.replace(/_/g, ' ').toLowerCase()}
                    </Badge>
                  ),
                },
                {
                  key: 'actions',
                  header: 'Decision',
                  align: 'right',
                  render: (place) => (
                    <div className="flex justify-end gap-2">
                      {place.status === 'PENDING_REVIEW' ? (
                        <>
                          <Button
                            size="sm"
                            loading={moderate.isPending}
                            onClick={() =>
                              moderate.mutate({
                                id: place.id,
                                status: 'PUBLISHED' as ContentStatus,
                                reason,
                              })
                            }
                          >
                            Publish
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            loading={moderate.isPending}
                            onClick={() =>
                              moderate.mutate({
                                id: place.id,
                                status: 'REJECTED' as ContentStatus,
                                reason,
                              })
                            }
                          >
                            Reject
                          </Button>
                        </>
                      ) : place.status === 'PUBLISHED' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={moderate.isPending}
                          onClick={() =>
                            moderate.mutate({
                              id: place.id,
                              status: 'ARCHIVED' as ContentStatus,
                              reason,
                            })
                          }
                        >
                          Archive
                        </Button>
                      ) : (
                        <span className="text-xs text-ink-faint">No action</span>
                      )}
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