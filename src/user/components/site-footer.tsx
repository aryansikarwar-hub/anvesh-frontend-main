'use client';

import { Link } from '@/user/router';
import { AnveshMark } from '@/ui';

const COLUMNS = [
  {
    title: 'Discover',
    links: [
      { href: '/explore', label: 'Explore hidden gems' },
      { href: '/map', label: 'Smart map' },
      { href: '/stories', label: 'Local stories' },
    ],
  },
  {
    title: 'Plan',
    links: [
      { href: '/planner', label: 'AI trip planner' },
      { href: '/ai', label: 'Ask Anvesh' },
      { href: '/dashboard', label: 'Your dashboard' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/profile', label: 'Profile' },
      { href: '/preferences', label: 'Preferences' },
      { href: '/reviews/mine', label: 'My reviews' },
    ],
  },
  {
    // The other two portals live in this same app, at these paths. Each has
    // its own sign-in; being signed in here does not sign you in there.
    title: 'Portals',
    links: [
      { href: '/partner', label: 'For local partners' },
      { href: '/guide', label: 'Tourist guides' },
      { href: '/admin', label: 'Staff' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-forest-deep text-cream">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-cream/10">
                <AnveshMark className="size-5" />
              </span>
              <span className="text-xl font-extrabold tracking-tight">Anvesh</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/70">
              Discover the places maps don&apos;t tell you about.
            </p>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-cream/50">
              Ranking here treats popularity as a penalty — quieter, locally owned places rank
              higher on purpose.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cream/50">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-cream/75 transition-colors hover:text-cream"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-cream/15 pt-6 text-xs text-cream/60 sm:flex-row sm:items-center">
          <p>Anvesh · Built for travel in India</p>
          <p>Made for the ones who wander.</p>
        </div>
      </div>
    </footer>
  );
}