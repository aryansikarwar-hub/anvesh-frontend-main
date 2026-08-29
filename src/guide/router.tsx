'use client';

import { forwardRef } from 'react';
import NextLink from 'next/link';
import {
  useRouter as useNextRouter,
  usePathname as useNextPathname,
  useSearchParams as useNextSearchParams,
  useParams as useNextParams,
} from 'next/navigation';
import type { ComponentPropsWithoutRef } from 'react';

/**
 * Routing for the traveller portal, which is mounted under /guide.
 *
 * Pages here write paths as if this portal owned the whole site — `/login`,
 * `/bookings/${id}` — and this module maps them onto the real URL. It is the
 * only place that knows about the prefix, so moving the portal is a one-line
 * change.
 *
 * Backed by Next's App Router (next/link, next/navigation) instead of
 * react-router-dom, but the exported API is unchanged so every page written
 * against it keeps working.
 */
export const BASE: string = '/guide';

/** `/bookings` -> `/guide/bookings`. External URLs pass through. */
export function withBase(href: string): string {
  if (!href.startsWith('/')) return href;
  if (!BASE) return href;
  return href === '/' ? BASE : `${BASE}${href}`;
}

/** `/guide/bookings` -> `/bookings`. The inverse of withBase. */
export function stripBase(pathname: string): string {
  if (!BASE) return pathname;
  if (pathname === BASE) return '/';
  return pathname.startsWith(`${BASE}/`) ? pathname.slice(BASE.length) : pathname;
}

export type LinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  href: string;
  replace?: boolean;
};

/**
 * Client-side link. Anything that is not an in-app path — an absolute URL, a
 * mailto:, an anchor — falls back to a plain anchor tag.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, replace, ...rest },
  ref,
) {
  if (!href.startsWith('/')) return <a ref={ref} href={href} {...rest} />;
  return <NextLink ref={ref} href={withBase(href)} replace={replace} {...rest} />;
});

/** The subset of Next's router this app actually used. */
export function useRouter() {
  const router = useNextRouter();
  return {
    push: (href: string) => router.push(withBase(href)),
    replace: (href: string) => router.replace(withBase(href)),
    back: () => router.back(),
    forward: () => router.forward(),
    refresh: () => router.refresh(),
  };
}

/** The current path, relative to this portal. */
export function usePathname(): string {
  return stripBase(useNextPathname() ?? '/');
}

/** Read-only query string, matching the shape pages were written against. */
export function useSearchParams(): URLSearchParams {
  const params = useNextSearchParams();
  return new URLSearchParams(params?.toString() ?? '');
}

/** Dynamic-segment params (`[slug]`, `[id]`), matching react-router's shape. */
export function useParams<T extends Record<string, string> = Record<string, string>>(): Partial<T> {
  const raw = useNextParams();
  const out: Record<string, string> = {};
  for (const key in raw) {
    const value = raw[key as keyof typeof raw];
    if (typeof value === 'string') out[key] = value;
    else if (Array.isArray(value)) out[key] = value.join('/');
  }
  return out as Partial<T>;
}
