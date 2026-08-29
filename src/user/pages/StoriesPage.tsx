'use client';

import { useState } from 'react';
import { Link } from '@/user/router';
import { BookOpen } from 'lucide-react';
import {
  ChipGroup,
  EmptyState,
  Input,
  PageHeader,
  PageShell,
  Pagination,
  STORY_KIND_LABELS,
  StoryCard,
} from '@/ui';
import { STORY_KINDS, type StoryKind } from '@/lib/types';
import { useStories } from '@/user/hooks/use-stories';
import { QueryBoundary } from '@/user/components/query-boundary';

const KIND_OPTIONS = [
  { value: '' as const, label: 'All' },
  ...STORY_KINDS.map((kind) => ({ value: kind, label: STORY_KIND_LABELS[kind] })),
];

/**
 * Local stories — the context a listing cannot carry, written by the guides
 * themselves and moderated like any other content.
 */
export default function StoriesPage() {
  const [kind, setKind] = useState<StoryKind | ''>('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const query = useStories({
    page,
    limit: 12,
    ...(kind ? { kind } : {}),
    ...(q.trim().length >= 2 ? { q: q.trim() } : {}),
  });

  return (
    <PageShell className="flex flex-col gap-8 py-12">
      <PageHeader
        eyebrow="Editorial"
        title="Stories Behind the Places"
        description="Food traditions, crafts, festivals and landscapes, written by the guides who know them — and linked to the places they are about."
      />

      <div className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-paper-raised p-4 shadow-soft ring-1 ring-line/70 sm:p-5">
        <div>
          <label htmlFor="story-q" className="sr-only">
            Search stories
          </label>
          <Input
            id="story-q"
            value={q}
            onChange={(event) => {
              setQ(event.target.value);
              setPage(1);
            }}
            placeholder="Search stories — rogan, biryani, fossils"
          />
        </div>
        <ChipGroup
          label="Kind"
          value={kind}
          options={KIND_OPTIONS}
          onChange={(value) => {
            setKind(value);
            setPage(1);
          }}
        />
      </div>

      <QueryBoundary
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        data={query.data}
        isEmpty={(data) => data.items.length === 0}
        onRetry={() => void query.refetch()}
        emptyTitle="No stories yet"
        emptyDescription="Stories are written by guides and published after moderation. On a development database, run the seed."
      >
        {(data) => (
          <div className="flex flex-col gap-6">
            <p className="text-sm text-ink-muted">
              <strong className="font-semibold text-ink">{data.pageInfo.total}</strong> stor
              {data.pageInfo.total === 1 ? 'y' : 'ies'}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((story) => (
                <StoryCard key={story.id} story={story} href={`/stories/${story.slug}`} />
              ))}
            </div>
            <Pagination pageInfo={data.pageInfo} onPageChange={setPage} />
          </div>
        )}
      </QueryBoundary>

      <EmptyState
        icon={<BookOpen className="size-7" />}
        title="Know a story worth telling?"
        description="Guides write these. If you run a kitchen, a workshop or a homestay, the guide portal is where you publish."
        action={
          <Link
            href="/partner"
            className="text-sm font-semibold text-laterite-600 underline underline-offset-4"
          >
            How it works for locals
          </Link>
        }
      />
    </PageShell>
  );
}