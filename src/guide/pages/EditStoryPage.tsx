'use client';

import { useParams } from '@/guide/router';
import { Badge, PageHeader } from '@/ui';
import { useMyStory, useStoryMutations } from '@/guide/hooks/use-guide';
import { StoryForm, toStoryValues } from '@/guide/components/story-form';
import { QueryBoundary } from '@/guide/components/query-boundary';
import { RequireAuth } from '@/guide/components/require-auth';
import { ContentStatusBadge } from '@/guide/components/status-badge';

export default function EditStoryPage() {
  const { id } = useParams() as { id: string };
  const query = useMyStory(id);
  const mutations = useStoryMutations();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Story" title="Edit story" />
      <RequireAuth>
        <QueryBoundary
          isLoading={query.isLoading}
          isError={query.isError}
          error={query.error}
          data={query.data}
          onRetry={() => void query.refetch()}
          skeleton="rows"
        >
          {({ story }) => (
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <ContentStatusBadge status={story.status} />
                <Badge variant="neutral">{story.readMinutes} min read</Badge>
                {story.status === 'PUBLISHED' ? (
                  <span className="text-sm text-ink-muted">
                    Saving an edit returns this story to review before it is visible again.
                  </span>
                ) : null}
              </div>

              {story.moderationNote ? (
                <p className="rounded-[var(--radius-control)] bg-gold-50 p-3 text-sm text-ink-soft ring-1 ring-gold-300/50">
                  <strong className="font-semibold">Moderator note:</strong> {story.moderationNote}
                </p>
              ) : null}

              <StoryForm
                initial={toStoryValues(story)}
                submitLabel="Save changes"
                pending={mutations.update.isPending}
                error={mutations.update.error}
                onSubmit={(payload) => mutations.update.mutate({ id: story.id, patch: payload })}
              />
            </div>
          )}
        </QueryBoundary>
      </RequireAuth>
    </div>
  );
}