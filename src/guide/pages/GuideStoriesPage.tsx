'use client';

import { useState } from 'react';
import { Link } from '@/guide/router';
import { Clock, MapPin, Plus, Send, Trash2 } from 'lucide-react';
import { Badge, Button, Card, CardContent, PageHeader, Pagination, STORY_KIND_LABELS } from '@/ui';
import { useMyStories, useStoryMutations } from '@/guide/hooks/use-guide';
import { QueryBoundary } from '@/guide/components/query-boundary';
import { RequireAuth } from '@/guide/components/require-auth';
import { ContentStatusBadge } from '@/guide/components/status-badge';

/**
 * Your local stories.
 *
 * The same publishing rule as places: you write and submit, a moderator
 * publishes. Editing a published story sends it back to review, which is
 * enforced on the server, not here.
 */
export default function GuideStoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Content"
        title="My stories"
        description="The context a listing cannot carry — a craft, a dish, a season. Written by you, published by a moderator."
        actions={
          <Button asChild>
            <Link href="/stories/new">
              <Plus aria-hidden="true" />
              Write a story
            </Link>
          </Button>
        }
      />
      <RequireAuth>
        <StoriesList />
      </RequireAuth>
    </div>
  );
}

function StoriesList() {
  const [page, setPage] = useState(1);
  const stories = useMyStories({ page });
  const mutations = useStoryMutations();

  return (
    <QueryBoundary
      isLoading={stories.isLoading}
      isError={stories.isError}
      error={stories.error}
      data={stories.data}
      isEmpty={(data) => data.items.length === 0}
      onRetry={() => void stories.refetch()}
      emptyTitle="You have not written a story yet"
      emptyDescription="Pick one thing you know that a listing cannot explain — why a dish is made that way, what a craft actually involves — and write a few hundred words about it."
      emptyAction={
        <Button asChild>
          <Link href="/stories/new">Write your first story</Link>
        </Button>
      }
      skeleton="rows"
    >
      {(data) => (
        <div className="flex flex-col gap-3">
          {data.items.map((story) => (
            <Card key={story.id}>
              <CardContent className="flex flex-wrap items-start justify-between gap-4 pt-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <ContentStatusBadge status={story.status} />
                    <Badge variant="neutral">{STORY_KIND_LABELS[story.kind]}</Badge>
                  </div>
                  <h3 className="pt-2 text-base font-semibold">
                    <Link href={`/stories/${story.id}`} className="hover:underline">
                      {story.title}
                    </Link>
                  </h3>
                  <p className="line-clamp-2 pt-1 text-sm text-ink-muted">{story.summary}</p>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-ink-faint">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3" aria-hidden="true" />
                      {story.city}, {story.state}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" aria-hidden="true" />
                      {story.readMinutes} min read
                    </span>
                    {story.placeCount > 0 ? (
                      <span>
                        {story.placeCount} linked {story.placeCount === 1 ? 'place' : 'places'}
                      </span>
                    ) : null}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/stories/${story.id}`}>Edit</Link>
                  </Button>
                  {story.status === 'DRAFT' || story.status === 'REJECTED' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      loading={mutations.submit.isPending}
                      onClick={() => mutations.submit.mutate(story.id)}
                    >
                      <Send aria-hidden="true" />
                      Submit
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="iconSm"
                    aria-label={`Delete ${story.title}`}
                    loading={mutations.remove.isPending}
                    onClick={() => mutations.remove.mutate(story.id)}
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