import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * shadcn/ui's `cn` helper — merges conditional class names and resolves
 * Tailwind conflicts. Identical to `@/ui/cn`; this copy exists only because
 * the components ported from Raahi's UI kit import it from this path.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
