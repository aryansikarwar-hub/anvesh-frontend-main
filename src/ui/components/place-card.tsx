'use client';

import { Bookmark, IndianRupee, MapPin, Star } from 'lucide-react';
import { type PlaceCard as PlaceCardData } from '@/lib/types';
import { formatMinor } from '@/lib/shared';
import { cn } from '../cn';
import { Badge } from './badge';
import { PlaceCover } from './place-cover';
import { CrowdBadge, MatchBadge, bestTimeLabel, durationLabel, formatMatch } from './signals';

export interface PlaceCardProps {
  place: PlaceCardData;
  href: string;
  onSave?: (placeId: string) => void;
  saved?: boolean;
  className?: string;
  /** `compact` drops the reasons and the secondary facts. */
  variant?: 'full' | 'compact';
}

/**
 * The card that carries the product's point of view.
 *
 * Crowd level, authenticity and local ownership are first-class facts on the
 * face of the card, and the match figure is this query's real discovery score.
 * Nothing here advertises how popular a place is — popularity is a penalty in
 * the ranking, so surfacing it would contradict the product.
 */
export function PlaceCard({
  place,
  href,
  onSave,
  saved,
  className,
  variant = 'full',
}: PlaceCardProps) {
  const bestTime = bestTimeLabel(place.bestTimeMonths ?? []);
  const duration = durationLabel(place.durationMin ?? 0);
  const category = place.categorySlugs[0];

  return (
    <article
      className={cn(
        'group anvesh-rise relative flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-paper-raised shadow-soft ring-1 ring-line/70',
        className,
      )}
    >
      <div className="relative">
        <PlaceCover
          title={place.title}
          slug={place.slug}
          image={place.coverImage}
          className="aspect-[16/10] w-full"
        />

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {typeof place.score === 'number' ? <MatchBadge score={place.score} /> : null}
            {category ? (
              <Badge variant="onImage">{category.replace(/-/g, ' ')}</Badge>
            ) : null}
          </div>

          {onSave ? (
            <button
              type="button"
              onClick={() => onSave(place.id)}
              aria-pressed={saved}
              aria-label={saved ? `Remove ${place.title} from saved` : `Save ${place.title}`}
              className="relative z-10 rounded-[var(--radius-pill)] bg-white/90 p-2 text-ink-soft shadow-soft backdrop-blur-sm transition-colors hover:text-laterite-600"
            >
              <Bookmark
                className={cn('size-4', saved && 'fill-laterite-500 text-laterite-500')}
                aria-hidden="true"
              />
            </button>
          ) : null}
        </div>

        <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold leading-snug text-white drop-shadow-sm">
              <a href={href} className="after:absolute after:inset-0">
                {place.title}
              </a>
            </h3>
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-white/85">
              <MapPin className="size-3 shrink-0" aria-hidden="true" />
              {place.city}, {place.state}
            </p>
          </div>
          {typeof place.distanceKm === 'number' ? (
            <span className="shrink-0 rounded-[var(--radius-pill)] bg-black/45 px-2 py-1 text-[11px] font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm">
              {place.distanceKm.toFixed(0)} km
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="line-clamp-2 text-sm leading-relaxed text-ink-soft">{place.summary}</p>

        <div className="flex flex-wrap items-center gap-1.5">
          <CrowdBadge level={place.crowdLevel} short />
          {place.ownership === 'LOCAL_OWNED' ? <Badge variant="local">Locally owned</Badge> : null}
          {place.ratingCount > 0 ? (
            <Badge variant="neutral">
              <Star className="size-3 fill-gold-500 text-gold-500" aria-hidden="true" />
              {place.ratingAvg.toFixed(1)}
              <span className="font-normal text-ink-faint">({place.ratingCount})</span>
            </Badge>
          ) : null}
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <div className="flex items-center gap-1.5">
            <IndianRupee className="size-3.5 shrink-0 text-ink-faint" aria-hidden="true" />
            <dt className="sr-only">Entry</dt>
            <dd className="font-semibold text-ink">
              {place.entryFeeMinor === 0 ? 'Free entry' : formatMinor(place.entryFeeMinor)}
            </dd>
          </div>
          {typeof place.authenticityScore === 'number' ? (
            <div className="flex items-center justify-end gap-1.5 text-right">
              <dt className="text-ink-muted">Authenticity</dt>
              <dd className="font-semibold tabular-nums text-ghat-600">
                {formatMatch(place.authenticityScore)}%
              </dd>
            </div>
          ) : null}
          {bestTime ? (
            <div className="flex items-center gap-1.5">
              <dt className="text-ink-muted">Best</dt>
              <dd className="font-medium text-ink-soft">{bestTime}</dd>
            </div>
          ) : null}
          {duration ? (
            <div className="flex items-center justify-end gap-1.5 text-right">
              <dt className="sr-only">Typical visit</dt>
              <dd className="font-medium text-ink-soft">{duration}</dd>
            </div>
          ) : null}
        </dl>

        {variant === 'full' && place.reasons?.length ? (
          <div className="mt-auto rounded-[var(--radius-control)] bg-paper-sunk px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              Why this is here
            </p>
            <p className="pt-0.5 text-xs leading-relaxed text-ink-soft">
              {place.reasons.join(' · ')}
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );
}