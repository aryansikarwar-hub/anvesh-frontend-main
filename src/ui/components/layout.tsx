'use client';

import * as React from 'react';
import { cn } from '../cn';

export function PageShell({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)} {...props} />
  );
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
}

export function PageHeader({ title, description, actions, eyebrow }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1.5">
        {eyebrow ? (
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-laterite-500">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="text-2xl sm:text-[2rem]">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-ink-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Section({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl">{title}</h2>
          {description ? <p className="pt-0.5 text-sm text-ink-muted">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Key figure tile used on the guide and admin dashboards. */
export function StatTile({
  label,
  value,
  hint,
  icon,
  tone = 'neutral',
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  tone?: 'neutral' | 'positive' | 'attention';
}) {
  return (
    <div className="rounded-[var(--radius-card)] bg-paper-raised p-4 shadow-soft ring-1 ring-line/70">
      <div className="flex items-center gap-2">
        {icon ? (
          <span className="text-ink-faint" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          {label}
        </span>
      </div>
      <div
        className={cn(
          'pt-1.5 font-display text-[1.75rem] font-bold leading-none tabular-nums',
          tone === 'positive' && 'text-ghat-600',
          tone === 'attention' && 'text-laterite-600',
        )}
      >
        {value}
      </div>
      {hint ? <div className="pt-1.5 text-xs text-ink-muted">{hint}</div> : null}
    </div>
  );
}

/**
 * A full-bleed band with a photographic feel, used for page heroes. The
 * gradient stands in for a photograph the project does not ship.
 */
export function HeroBand({
  className,
  children,
  tone = 'ghat',
}: {
  className?: string;
  children: React.ReactNode;
  tone?: 'ghat' | 'laterite' | 'dusk';
}) {
  const gradients = {
    ghat: 'linear-gradient(135deg, #1e5540 0%, #2f7d5c 45%, #7db69a 100%)',
    laterite: 'linear-gradient(135deg, #7c3216 0%, #c25526 50%, #e69f74 100%)',
    dusk: 'linear-gradient(135deg, #2c3e50 0%, #4a3b62 45%, #a3421c 100%)',
  } as const;

  return (
    <section
      className={cn('relative overflow-hidden text-white', className)}
      style={{ backgroundImage: gradients[tone] }}
    >
      <div className="anvesh-grain absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative">{children}</div>
    </section>
  );
}