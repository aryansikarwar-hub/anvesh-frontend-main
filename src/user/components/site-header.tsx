'use client';

import { useState } from 'react';
import { Link, usePathname, useRouter } from '@/user/router';
import {
  Bell,
  Bookmark,
  Compass,
  LayoutDashboard,
  Map,
  Menu,
  Search,
  Sparkles,
  Store,
  X,
} from 'lucide-react';
import { AnveshMark, Button, cn } from '@/ui';
import { useCurrentUser, useLogout } from '@/user/hooks/use-session';

/**
 * Primary navigation, in Raahi's sticky glass style: a pill-shaped active
 * state instead of an underline, a round profile chip, and a "Plan with AI"
 * button riding along the right edge. `pathname.startsWith` is what lets
 * /stories/some-slug still light up the Stories tab.
 */
const NAV = [
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/planner', label: 'AI Planner', icon: Sparkles },
  { href: '/map', label: 'Map', icon: Map },
  { href: '/stories', label: 'Stories', icon: Bookmark },
  { href: '/partner', label: 'For Locals', icon: Store },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useCurrentUser();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/explore');
    setOpen(false);
  }

  const initial = user?.profile.displayName?.trim()?.[0]?.toUpperCase() ?? 'A';

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 glass">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Anvesh home">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
            <AnveshMark className="size-5" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-foreground">Anvesh</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
                pathname.startsWith(item.href) && 'bg-accent font-semibold text-primary',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form
          onSubmit={submitSearch}
          className="ml-auto hidden max-w-xs flex-1 xl:block"
          role="search"
        >
          <label htmlFor="header-search" className="sr-only">
            Search places
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="header-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Waterfalls near Ujire"
              className="h-10 w-full rounded-full border border-border bg-secondary/60 pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1.5 xl:ml-0">
          {isAuthenticated ? (
            <>
              <Link
                href="/saved"
                aria-label="Saved places"
                className="hidden size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:flex"
              >
                <Bookmark className="size-4.5" aria-hidden="true" />
              </Link>
              <Link
                href="/notifications"
                aria-label="Notifications"
                className="hidden size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:flex"
              >
                <Bell className="size-4.5" aria-hidden="true" />
              </Link>
              <Link
                href="/dashboard"
                aria-label="Dashboard"
                className="hidden size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:flex"
              >
                <LayoutDashboard className="size-4.5" aria-hidden="true" />
              </Link>
              <Link
                href="/profile"
                aria-label={`Profile — ${user?.profile.displayName ?? ''}`}
                className="flex size-9 items-center justify-center rounded-full bg-clay/15 text-sm font-bold text-clay"
              >
                {initial}
              </Link>
              <Button asChild className="ml-1 hidden rounded-full shadow-soft sm:inline-flex">
                <Link href="/planner">
                  <Sparkles className="size-4" aria-hidden="true" />
                  Plan with AI
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden rounded-full sm:inline-flex">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="hidden rounded-full shadow-soft sm:inline-flex">
                <Link href="/register">Join Anvesh</Link>
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="iconSm"
            className="rounded-full lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>
        </div>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-border/60 bg-card lg:hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-3">
            <form onSubmit={submitSearch} role="search" className="pb-2">
              <label htmlFor="mobile-search" className="sr-only">
                Search places
              </label>
              <input
                id="mobile-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search quiet places"
                className="h-11 w-full rounded-full border border-border bg-secondary/60 px-4 text-sm"
              />
            </form>
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <LayoutDashboard className="size-4" aria-hidden="true" />
                Dashboard
              </Link>
            ) : null}
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
            {!isAuthenticated ? (
              <div className="flex gap-2 pt-2">
                <Button asChild variant="secondary" className="flex-1 rounded-full">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild className="flex-1 rounded-full">
                  <Link href="/register">Join</Link>
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                className="mt-2 rounded-full"
                loading={logout.isPending}
                onClick={() => logout.mutate()}
              >
                Sign out
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}