'use client';

import * as React from 'react';
import { AlertTriangle, Compass, RefreshCw } from 'lucide-react';
import { cn } from '../cn';
import { Button } from './button';

/** Loading placeholder. Uses aria-hidden so it is not announced twice. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-paper-sunk', className)}
      {...props}
    />
  );
}

export function LoadingState({ label = 'Loading', rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-24 w-full" />
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      <span className="sr-only">Loading results</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex flex-col gap-3">
          <Skeleton className="aspect-[4/3] w-full rounded-[var(--radius-card)]" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-dashed border-line-strong bg-paper-raised/60 px-6 py-14 text-center">
      <div className="text-ink-faint" aria-hidden="true">
        {icon ?? <Compass className="size-7" />}
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="max-w-md text-sm text-ink-muted">{description}</p>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  code?: string;
  requestId?: string;
}

/**
 * Error surface. It shows the request id when there is one, because that is the
 * single thing that lets support find the matching server log line.
 */
export function ErrorState({
  title = 'Something went wrong',
  description = 'The request did not go through. Try again in a moment.',
  onRetry,
  code,
  requestId,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-danger-500/25 bg-danger-50 px-6 py-10 text-center"
    >
      <AlertTriangle className="size-6 text-danger-500" aria-hidden="true" />
      <h3 className="text-base font-semibold text-danger-700">{title}</h3>
      <p className="max-w-md text-sm text-ink-soft">{description}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw aria-hidden="true" />
          Try again
        </Button>
      ) : null}
      {code || requestId ? (
        <p className="pt-1 font-mono text-[11px] text-ink-faint">
          {code}
          {code && requestId ? ' · ' : ''}
          {requestId}
        </p>
      ) : null}
    </div>
  );
}