'use client';

import { useId, useState } from 'react';
import { cn } from '../cn';

export interface BarDatum {
  /** Short axis label, e.g. "Mon". */
  label: string;
  /** Full label for the tooltip and the table view, e.g. "Mon 24 Aug". */
  fullLabel: string;
  value: number;
}

/**
 * A short bar chart for a count over consecutive days.
 *
 * Deliberately one series, so there is no legend — the caption names what is
 * being counted. Only the largest bar is labelled directly; every other value
 * is available on hover and, for anyone not using a pointer, in the table that
 * sits behind the chart for screen readers.
 *
 * Zero is drawn as a visible sliver rather than nothing, so a quiet day reads
 * as "measured, and it was zero" instead of "no data".
 */
export function BarWeek({
  data,
  caption,
  unit = '',
  className,
}: {
  data: BarDatum[];
  caption: string;
  unit?: string;
  className?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const tableId = useId();

  const max = Math.max(1, ...data.map((d) => d.value));
  const peak = data.reduce((best, d, i) => (d.value > (data[best]?.value ?? -1) ? i : best), 0);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (!data.length) return null;

  return (
    <figure className={cn('flex flex-col gap-3', className)}>
      <div className="relative flex h-40 items-end gap-[2px]" aria-describedby={tableId}>
        {data.map((datum, index) => {
          const height = total === 0 ? 2 : Math.max(2, Math.round((datum.value / max) * 100));
          const isPeak = index === peak && datum.value > 0;
          const active = hovered === index;

          return (
            <div
              key={datum.fullLabel}
              className="group relative flex h-full flex-1 flex-col justify-end"
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(index)}
              onBlur={() => setHovered(null)}
              tabIndex={0}
              /* The table below carries the same numbers for assistive tech, so
                 the bars themselves stay out of the accessibility tree. */
              aria-hidden="true"
            >
              {active || isPeak ? (
                <span
                  className={cn(
                    'absolute inset-x-0 -top-0.5 z-10 text-center text-[11px] font-semibold tabular-nums',
                    active ? 'text-ink' : 'text-ink-muted',
                  )}
                  style={{ bottom: `calc(${height}% + 6px)`, top: 'auto' }}
                >
                  {datum.value}
                </span>
              ) : null}

              <div
                className={cn(
                  'w-full rounded-t-[4px] transition-colors',
                  active ? 'bg-laterite-600' : 'bg-laterite-400',
                  datum.value === 0 && 'bg-line-strong',
                )}
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex gap-[2px]" aria-hidden="true">
        {data.map((datum, index) => (
          <span
            key={datum.fullLabel}
            className={cn(
              'flex-1 text-center text-[11px]',
              hovered === index ? 'font-semibold text-ink' : 'text-ink-faint',
            )}
          >
            {datum.label}
          </span>
        ))}
      </div>

      <figcaption className="text-xs text-ink-muted">
        {caption}
        {total > 0 ? (
          <>
            {' · '}
            <strong className="font-semibold text-ink-soft">{total}</strong> in total
          </>
        ) : null}
      </figcaption>

      {/* The same data as a table. Visually hidden, but it is what a screen
          reader reads, and it is why the bars can be aria-hidden. */}
      <table id={tableId} className="sr-only">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">{unit || 'Count'}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((datum) => (
            <tr key={datum.fullLabel}>
              <th scope="row">{datum.fullLabel}</th>
              <td>{datum.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}