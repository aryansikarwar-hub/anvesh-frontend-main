'use client';

import { useEffect } from 'react';

/**
 * Sets the browser tab title.
 *
 * React Router's version read this from the matched route's `handle.title`
 * via `useMatches()`. Next's App Router has no client-side match list to
 * read at runtime (route metadata is a static `export const metadata` on
 * server components), so each generated page wrapper now passes its own
 * title straight through instead.
 */
export function useSetTitle(title: string, suffix: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${suffix}` : suffix;
  }, [title, suffix]);
}

/** Back-compat alias for call sites that only have the portal suffix. */
export function usePageTitle(suffix: string): void {
  useSetTitle('', suffix);
}
