'use client';

import { cn } from '../cn';

/** The Anvesh mark: a compass rose drawn as a simple four-point star. */
export function AnveshMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('size-6', className)}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9.25" />
      <path d="M12 4.5 13.9 10.1 19.5 12 13.9 13.9 12 19.5 10.1 13.9 4.5 12 10.1 10.1Z" />
    </svg>
  );
}

export function Wordmark({
  portal,
  className,
}: {
  portal?: 'Guide' | 'Admin';
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-baseline gap-2', className)}>
      <span className="font-display text-xl font-semibold tracking-tight text-laterite-600">
        Anvesh
      </span>
      {portal ? (
        <span className="rounded-full border border-line-strong px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          {portal}
        </span>
      ) : null}
    </span>
  );
}

export const TAGLINE = "Discover the places maps don't tell you about.";