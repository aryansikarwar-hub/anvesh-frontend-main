'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-semibold leading-none',
  {
    variants: {
      variant: {
        neutral: 'bg-paper-sunk text-ink-soft ring-1 ring-line',
        local: 'bg-ghat-50 text-ghat-700 ring-1 ring-ghat-100',
        quiet: 'bg-gold-50 text-gold-700 ring-1 ring-gold-300/50',
        warn: 'bg-laterite-50 text-laterite-600 ring-1 ring-laterite-100',
        danger: 'bg-danger-50 text-danger-700 ring-1 ring-danger-500/20',
        success: 'bg-success-50 text-success-700 ring-1 ring-success-500/20',
        /** For a badge laid over a photograph or a cover gradient. */
        onImage: 'bg-black/45 text-white ring-1 ring-white/25 backdrop-blur-sm',
        /** The single strongest emphasis available; use sparingly. */
        accent: 'bg-laterite-500 text-white',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };