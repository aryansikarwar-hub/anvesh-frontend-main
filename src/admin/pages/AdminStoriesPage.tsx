'use client';

import { Suspense, useState } from 'react';
import {
  Badge,
  Button,
  LoadingState,
  PageHeader,
  Pagination,
  STORY_KIND_LABELS,
  Select,
  Textarea,
} from '@/ui';
import { type ContentStatus, type StoryCard } from '@/lib/types';
import { useAdminStories, useModerateStory } from '@/admin/hooks/use-admin';
import { QueryBoundary } from '@/admin/components/query-boundary';
import { RequireAuth } from '@/admin/components/require-auth';
import { DataTable } from '@/admin/components/data-table';
import { describeError } from '@/admin/lib/api';

/**
 * Story moderation. Same gate as places: a guide submits, a moderator
 * publishes, and every decision lands in the audit log.
 */
export default function AdminStoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Moderation"
        title="Stories"
        description="Local stories written by guides. Read before publishing — this is the one surface where a guide writes long-form prose."
      />
      <RequireAuth>
        <Suspense fallback={<LoadingState rows={4} />}>
          <StoriesQueue />
        </Suspense>
      </RequireAuth>
    </div>
  );
}

function StoriesQueue() {
  const [status, setStatus] = useState('PENDING_REVIEW');
  const [page, setPage] = useState(1);
  const stories = useAdminStories({ page, ...(status ? { status } : {}) });
  const moderate = useModerateStory();
  const [reason, setReason] = useState('');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="max-w-xs flex-1">
          <label htmlFor="story-status" className="text-sm font-medium text-ink-soft">
            Status
          </label>
          <Select
            id="story-status"
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
          <label htmlFor="story-reason" className="text-sm font-medium text-ink-soft">
            Note sent to the guide
          </label>
          <Textarea
            id="story-reason"
            className="mt-1 min-h-10"
            maxLength={400}
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
        isLoading={stories.isLoading}
        isError={stories.isError}
        error={stories.error}
        data={stories.data}
        isEmpty={(data) => data.items.length === 0}
        onRetry={() => void stories.refetch()}
        emptyTitle="Nothing in this queue"
        emptyDescription="No stories match that status right now."
        skeleton="rows"
      >
        {(data) => (
          <div className="flex flex-col gap-4">
            <DataTable<StoryCard>
              caption="Stories awaiting moderation"
              rows={data.items}
              rowKey={(story) => story.id}
              columns={[
                {
                  key: 'title',
                  header: 'Story',
                  render: (story) => (
                    <div>
                      <p className="font-medium">{story.title}</p>
                      <p className="text-xs text-ink-muted">
                        {STORY_KIND_LABELS[story.kind]} · {story.city}, {story.state} ·{' '}
                        {story.readMinutes} min read
                      </p>
                      <p className="max-w-md pt-1 text-xs text-ink-faint">{story.summary}</p>
                    </div>
                  ),
                },
                {
                  key: 'guide',
                  header: 'Written by',
                  render: (story) => (
                    <span className="text-xs">
                      {story.guideSummary?.displayName ?? 'Unknown'}
                      {story.guideSummary?.verified ? ' (verified)' : ''}
                    </span>
                  ),
                },
                {
                  key: 'places',
                  header: 'Links',
                  numeric: true,
                  render: (story) => <span className="text-xs">{story.placeCount} places</span>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (story) => (
                    <Badge variant={story.status === 'PUBLISHED' ? 'success' : 'neutral'}>
                      {story.status.replace(/_/g, ' ').toLowerCase()}
                    </Badge>
                  ),
                },
                {
                  key: 'actions',
                  header: 'Decision',
                  align: 'right',
                  render: (story) => (
                    <div className="flex justify-end gap-2">
                      {story.status === 'PENDING_REVIEW' ? (
                        <>
                          <Button
                            size="sm"
                            loading={moderate.isPending}
                            onClick={() =>
                              moderate.mutate({
                                id: story.id,
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
                                id: story.id,
                                status: 'REJECTED' as ContentStatus,
                                reason,
                              })
                            }
                          >
                            Reject
                          </Button>
                        </>
                      ) : story.status === 'PUBLISHED' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={moderate.isPending}
                          onClick={() =>
                            moderate.mutate({
                              id: story.id,
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