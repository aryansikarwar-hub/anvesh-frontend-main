'use client';

import { BookOpen, Clock, MapPin } from 'lucide-react';
import { type StoryCard as StoryCardData, type StoryKind } from '@/lib/types';
import { cn } from '../cn';
import { Badge } from './badge';
import { PlaceCover } from './place-cover';

/** Human labels for the closed list of story kinds. */
export const STORY_KIND_LABELS: Record<StoryKind, string> = {
  FOOD: 'Food',
  CRAFT: 'Craft',
  FESTIVAL: 'Festival',
  HISTORY: 'History',
  NATURE: 'Nature',
  PEOPLE: 'People',
};

export function StoryCard({
  story,
  href,
  className,
}: {
  story: StoryCardData;
  href: string;
  className?: string;
}) {
  return (
    <article
      className={cn(
        'group anvesh-rise relative flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-paper-raised shadow-soft ring-1 ring-line/70',
        className,
      )}
    >
      <div className="relative">
        <PlaceCover
          title={story.title}
          slug={story.slug}
          image={story.coverImage}
          className="aspect-[16/9] w-full"
        />
        <div className="absolute inset-x-3 top-3 flex flex-wrap gap-1.5">
          <Badge variant="onImage">{STORY_KIND_LABELS[story.kind]}</Badge>
          <Badge variant="onImage">
            <Clock className="size-3" aria-hidden="true" />
            {story.readMinutes} min read
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base font-semibold leading-snug">
          <a href={href} className="after:absolute after:inset-0 hover:underline">
            {story.title}
          </a>
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-ink-soft">{story.summary}</p>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden="true" />
            {story.city}, {story.state}
          </span>
          {story.placeCount > 0 ? (
            <span className="inline-flex items-center gap-1">
              <BookOpen className="size-3.5" aria-hidden="true" />
              {story.placeCount} {story.placeCount === 1 ? 'place' : 'places'}
            </span>
          ) : null}
        </div>

        {story.guideSummary ? (
          <p className="text-xs text-ink-faint">
            by {story.guideSummary.displayName}
            {story.guideSummary.verified ? ' · verified guide' : ''}
          </p>
        ) : null}
      </div>
    </article>
  );
}