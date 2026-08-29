'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] font-semibold transition-[background-color,color,box-shadow,transform,border-color] duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-px',
  {
    variants: {
      variant: {
        primary:
          'bg-laterite-500 text-white shadow-soft hover:bg-laterite-600 focus-visible:bg-laterite-600',
        secondary:
          'bg-paper-raised text-ink shadow-soft ring-1 ring-line-strong/70 hover:bg-paper-sunk',
        ghost: 'text-ink-soft hover:bg-paper-sunk hover:text-ink',
        outline: 'ring-1 ring-laterite-300 text-laterite-600 hover:bg-laterite-50',
        /** For a button sitting on top of a photograph or a cover gradient. */
        onImage:
          'bg-white/92 text-ink shadow-lift backdrop-blur-sm hover:bg-white',
        local: 'bg-ghat-500 text-white shadow-soft hover:bg-ghat-600',
        danger: 'bg-danger-500 text-white shadow-soft hover:bg-danger-700',
        link: 'text-laterite-600 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-9 px-3.5 text-[13px]',
        md: 'h-11 px-5 text-sm',
        lg: 'h-13 px-7 text-base',
        icon: 'h-11 w-11 p-0',
        iconSm: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, loading = false, children, disabled, ...props },
  ref,
) {
  // With asChild the caller supplies the element (usually a Link), and Slot
  // requires exactly one child — so the spinner is only added for real buttons.
  if (asChild) {
    return (
      <Slot ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
});

export { buttonVariants };