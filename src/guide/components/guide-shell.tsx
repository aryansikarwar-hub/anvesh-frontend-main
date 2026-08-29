'use client';

import { Link } from '@/guide/router';
import { usePathname } from '@/guide/router';
import { useState } from 'react';
import {
  BarChart3,
  BookOpen,
  CalendarRange,
  Compass,
  LayoutDashboard,
  Menu,
  MapPinned,
  MessageSquare,
  Receipt,
  Settings,
  Star,
  Wallet,
  X,
} from 'lucide-react';
import { AnveshMark, Button, Wordmark, cn } from '@/ui';
import { useCurrentUser, useLogout } from '@/guide/hooks/use-session';

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/places', label: 'My places', icon: MapPinned },
  { href: '/experiences', label: 'Experiences', icon: Compass },
  { href: '/availability', label: 'Availability', icon: CalendarRange },
  { href: '/bookings', label: 'Bookings', icon: Receipt },
  { href: '/earnings', label: 'Earnings', icon: Wallet },
  { href: '/stories', label: 'Stories', icon: BookOpen },
  { href: '/reviews', label: 'Reviews', icon: Star },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/notifications', label: 'Notifications', icon: MessageSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const AUTH_ROUTES = ['/login', '/forgot-password', '/reset-password'];

export function GuideShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useCurrentUser();
  const logout = useLogout();
  const [open, setOpen] = useState(false);

  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    return <main id="main">{children}</main>;
  }

  return (
    <div className="flex min-h-dvh">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-line bg-paper-raised transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Guide navigation"
      >
        <div className="flex h-16 items-center gap-2 border-b border-line px-5">
          <AnveshMark className="text-laterite-600" />
          <Wordmark portal="Guide" />
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2.5 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-sunk hover:text-ink',
                  active && 'bg-laterite-50 text-laterite-600',
                )}
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-paper/90 px-4 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>

          <div className="ml-auto flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="hidden text-sm text-ink-muted sm:inline">
                  {user?.profile.displayName}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={logout.isPending}
                  onClick={() => logout.mutate()}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <Button asChild size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
            )}
          </div>
        </header>

        <main id="main" className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}