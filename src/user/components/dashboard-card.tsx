'use client';

import * as React from 'react';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { Link } from '@/user/router';
import { cn } from '@/ui';

/**
 * A titled, icon-led card for a dashboard grid — trips, saved places, AI
 * picks, partner metrics. One shape used everywhere the traveller dashboard
 * needs a "here's a slice of your data, with a way to see more" panel.
 */
export function DashboardCard({
  title,
  icon: Icon,
  actionLabel,
  actionHref,
  className,
  children,
}: {
  title: React.ReactNode;
  icon: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn('rounded-[var(--radius-card)] border border-line bg-paper-raised p-5 shadow-soft', className)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold tracking-tight text-ink">
          <span className="flex size-7 items-center justify-center rounded-lg bg-laterite-50 text-laterite-600">
            <Icon className="size-3.5" />
          </span>
          {title}
        </h3>
        {actionLabel && actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-1 text-xs font-semibold text-laterite-600 hover:underline"
          >
            {actionLabel}
            <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}