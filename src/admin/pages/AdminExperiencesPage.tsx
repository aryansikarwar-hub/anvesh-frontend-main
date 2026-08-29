'use client';

import { useState } from 'react';
import { Badge, Button, Money, PageHeader, Pagination, Select, Textarea } from '@/ui';
import { type Experience } from '@/lib/types';
import { useAdminExperiences, useModerateExperience } from '@/admin/hooks/use-admin';
import { QueryBoundary } from '@/admin/components/query-boundary';
import { RequireAuth } from '@/admin/components/require-auth';
import { DataTable } from '@/admin/components/data-table';

export default function AdminExperiencesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Moderation"
        title="Experiences"
        description="Bookable, priced listings. Publishing one makes it purchasable, so review the price and the meeting point."
      />
      <RequireAuth>
        <ExperienceQueue />
      </RequireAuth>
    </div>
  );
}

function ExperienceQueue() {
  const [status, setStatus] = useState('PENDING_REVIEW');
  const [page, setPage] = useState(1);
  const [reason, setReason] = useState('');
  const experiences = useAdminExperiences({ page, ...(status ? { status } : {}) });
  const moderate = useModerateExperience();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="max-w-xs flex-1">
          <label htmlFor="exp-status" className="text-sm font-medium text-ink-soft">
            Status
          </label>
          <Select
            id="exp-status"
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
          </Select>
        </div>
        <div className="min-w-64 flex-1">
          <label htmlFor="exp-reason" className="text-sm font-medium text-ink-soft">
            Note to the guide
          </label>
          <Textarea
            id="exp-reason"
            className="mt-1 min-h-10"
            maxLength={500}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </div>
      </div>

      <QueryBoundary
        isLoading={experiences.isLoading}
        isError={experiences.isError}
        error={experiences.error}
        data={experiences.data}
        isEmpty={(data) => data.items.length === 0}
        onRetry={() => void experiences.refetch()}
        emptyTitle="Nothing in this queue"
        emptyDescription="No experiences match that status."
        skeleton="rows"
      >
        {(data) => (
          <div className="flex flex-col gap-4">
            <DataTable<Experience>
              caption="Experiences awaiting moderation"
              rows={data.items}
              rowKey={(experience) => experience.id}
              columns={[
                {
                  key: 'title',
                  header: 'Experience',
                  render: (experience) => (
                    <div>
                      <p className="font-medium">{experience.title}</p>
                      <p className="max-w-md pt-1 text-xs text-ink-muted">{experience.summary}</p>
                    </div>
                  ),
                },
                {
                  key: 'guide',
                  header: 'Guide',
                  render: (experience) => (
                    <span className="text-xs">
                      {experience.guideSummary.displayName}
                      {experience.guideSummary.verified ? ' (verified)' : ' (unverified)'}
                    </span>
                  ),
                },
                {
                  key: 'price',
                  header: 'Price',
                  numeric: true,
                  align: 'right',
                  render: (experience) => <Money minor={experience.basePriceMinor} />,
                },
                {
                  key: 'seats',
                  header: 'Seats',
                  numeric: true,
                  align: 'right',
                  render: (experience) => experience.maxSeats,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (experience) => (
                    <Badge variant={experience.status === 'PUBLISHED' ? 'success' : 'neutral'}>
                      {experience.status.replace(/_/g, ' ').toLowerCase()}
                    </Badge>
                  ),
                },
                {
                  key: 'actions',
                  header: 'Decision',
                  align: 'right',
                  render: (experience) => (
                    <div className="flex justify-end gap-2">
                      {experience.status === 'PENDING_REVIEW' ? (
                        <>
                          <Button
                            size="sm"
                            loading={moderate.isPending}
                            onClick={() =>
                              moderate.mutate({ id: experience.id, status: 'PUBLISHED', reason })
                            }
                          >
                            Publish
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            loading={moderate.isPending}
                            onClick={() =>
                              moderate.mutate({ id: experience.id, status: 'REJECTED', reason })
                            }
                          >
                            Reject
                          </Button>
                        </>
                      ) : experience.status === 'PUBLISHED' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={moderate.isPending}
                          onClick={() =>
                            moderate.mutate({ id: experience.id, status: 'ARCHIVED', reason })
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