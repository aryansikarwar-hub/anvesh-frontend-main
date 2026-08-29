'use client';

import { formatMinor } from '@/lib/shared';

/**
 * Renders an integer minor-unit amount. Taking a number of paise (never a
 * float rupee value) is the whole point of this component existing.
 */
export function Money({
  minor,
  currency = 'INR',
  suffix,
  className,
}: {
  minor: number;
  currency?: string;
  suffix?: string;
  className?: string;
}) {
  return (
    <span className={className}>
      {formatMinor(minor, currency)}
      {suffix ? <span className="text-ink-muted"> {suffix}</span> : null}
    </span>
  );
}