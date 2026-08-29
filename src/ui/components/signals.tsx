'use client';

import { Sparkles, Users } from 'lucide-react';
import { cn } from '../cn';
import { Badge } from './badge';

/**
 * The small readouts that carry Anvesh's point of view onto a card: how well a
 * place matches you, how crowded it is, and how authentic moderation judged it.
 *
 * Every figure here is a real number from the API. `match` in particular is the
 * discovery score for this query, not a marketing percentage — which is why it
 * is absent on any list that was not ranked for you.
 */

export function formatMatch(score: number): number {
  return Math.round(Math.max(0, Math.min(1, score)) * 100);
}

/** Shown only when the API returned a score for this card. */
export function MatchBadge({ score, className }: { score: number; className?: string }) {
  return (
    <Badge variant="accent" className={cn('shadow-soft', className)}>
      <Sparkles className="size-3" aria-hidden="true" />
      {formatMatch(score)}% match
    </Badge>
  );
}

export function crowdLabel(level: number): {
  text: string;
  short: string;
  variant: 'quiet' | 'neutral' | 'warn';
} {
  if (level <= 0.25) return { text: 'Rarely crowded', short: 'Low crowd', variant: 'quiet' };
  if (level <= 0.55) return { text: 'Quiet on weekdays', short: 'Moderate', variant: 'neutral' };
  return { text: 'Gets busy', short: 'High crowd', variant: 'warn' };
}

export function CrowdBadge({ level, short = false }: { level: number; short?: boolean }) {
  const crowd = crowdLabel(level);
  return (
    <Badge variant={crowd.variant}>
      <Users className="size-3" aria-hidden="true" />
      {short ? crowd.short : crowd.text}
    </Badge>
  );
}

/** A labelled 0..1 bar. Used for authenticity, quality and crowd readouts. */
export function SignalBar({
  label,
  value,
  tone = 'ghat',
  className,
}: {
  label: string;
  value: number;
  tone?: 'ghat' | 'laterite' | 'gold';
  className?: string;
}) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="text-ink-muted">{label}</span>
        <span className="font-semibold tabular-nums text-ink-soft">{pct}%</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-[var(--radius-pill)] bg-paper-deep"
        role="img"
        aria-label={`${label}: ${pct} out of 100`}
      >
        <div
          className={cn(
            'h-full rounded-[var(--radius-pill)]',
            tone === 'ghat' && 'bg-ghat-500',
            tone === 'laterite' && 'bg-laterite-500',
            tone === 'gold' && 'bg-gold-500',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Turns [10,11,12,1] into "Oct–Jan", handling the wrap around the year end.
 * Returns null when a place is worth visiting at any time.
 */
export function bestTimeLabel(months: number[]): string | null {
  if (!months.length || months.length >= 12) return null;

  const sorted = [...new Set(months)].filter((m) => m >= 1 && m <= 12).sort((a, b) => a - b);
  if (!sorted.length) return null;
  if (sorted.length === 1) return MONTHS[sorted[0]! - 1] ?? null;

  // Find the largest gap; the window starts right after it. That is what makes
  // Oct-Nov-Dec-Jan read as "Oct–Jan" rather than "Jan–Dec".
  let gapAt = 0;
  let gapSize = sorted[0]! + 12 - sorted[sorted.length - 1]!;
  for (let i = 1; i < sorted.length; i += 1) {
    const gap = sorted[i]! - sorted[i - 1]!;
    if (gap > gapSize) {
      gapSize = gap;
      gapAt = i;
    }
  }

  const start = sorted[gapAt]!;
  const end = sorted[(gapAt + sorted.length - 1) % sorted.length]!;
  return start === end ? MONTHS[start - 1]! : `${MONTHS[start - 1]}–${MONTHS[end - 1]}`;
}

/** "About 4 hours", "Half day", "Full day" — from the stored minute count. */
export function durationLabel(minutes: number): string | null {
  if (!minutes) return null;
  if (minutes >= 480) return 'Full day';
  if (minutes >= 240) return 'Half day';
  if (minutes >= 90) return `About ${Math.round(minutes / 60)} hours`;
  return `About ${minutes} min`;
}