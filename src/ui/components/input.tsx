'use client';

import * as React from 'react';
import { cn } from '../cn';

const fieldClasses =
  'w-full rounded-[var(--radius-control)] bg-paper-raised px-3.5 text-sm text-ink shadow-[var(--shadow-inset)] ring-1 ring-line-strong/70 transition-shadow placeholder:text-ink-faint focus:ring-2 focus:ring-laterite-300 disabled:cursor-not-allowed disabled:bg-paper-sunk disabled:opacity-70 aria-[invalid=true]:ring-danger-500';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(fieldClasses, 'h-11', className)} {...props} />;
  },
);

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(fieldClasses, 'min-h-28 py-2.5', className)} {...props} />;
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, ...props }, ref) {
  return <select ref={ref} className={cn(fieldClasses, 'h-11 pr-8', className)} {...props} />;
});

export interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

/** Label, hint and error wired to the control for screen readers. */
export function Field({ label, htmlFor, hint, error, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-soft">
        {label}
        {required ? (
          <span className="ml-0.5 text-danger-500" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs font-medium text-danger-500">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * A single-choice row of pills. Used for the explore filters, where a
 * <select> would hide the available options behind an extra tap.
 */
export function ChipGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </span>
      {/* Wraps rather than scrolls: a clipped chip row reads as broken, and
          there is no scroll affordance on a desktop trackpad. */}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value || 'any'}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={active}
              className={cn(
                'shrink-0 rounded-[var(--radius-pill)] px-3.5 py-1.5 text-[13px] font-medium transition-colors',
                active
                  ? 'bg-laterite-500 text-white shadow-soft'
                  : 'bg-paper-raised text-ink-soft ring-1 ring-line-strong/70 hover:border-laterite-300 hover:bg-paper-sunk',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}