'use client';

import { Link } from '@/admin/router';
import { usePathname } from '@/admin/router';
import { useState } from 'react';
import {
  Activity,
  BookOpen,
  BarChart3,
  Brain,
  CreditCard,
  Flag,
  LayoutDashboard,
  MapPinned,
  Menu,
  Receipt,
  ScrollText,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react';
import { AnveshMark, Button, Wordmark, cn } from '@/ui';
import { useCurrentUser, useLogout } from '@/admin/hooks/use-admin-session';

const GROUPS = [
  {
    title: 'Overview',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/system', label: 'System health', icon: Activity },
    ],
  },
  {
    title: 'Moderation',
    items: [
      { href: '/places', label: 'Places', icon: MapPinned },
      { href: '/experiences', label: 'Experiences', icon: Sparkles },
      { href: '/stories', label: 'Stories', icon: BookOpen },
      { href: '/reviews', label: 'Reviews', icon: Star },
      { href: '/reports', label: 'Reports', icon: Flag },
    ],
  },
  {
    title: 'People',
    items: [
      { href: '/users', label: 'Users', icon: Users },
      { href: '/guides', label: 'Tourist guides', icon: ShieldCheck },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { href: '/bookings', label: 'Bookings', icon: Receipt },
      { href: '/payments', label: 'Payments', icon: CreditCard },
    ],
  },
  {
    title: 'Platform',
    items: [
      { href: '/recommendations', label: 'Ranking config', icon: Settings2 },
      { href: '/ai', label: 'AI monitoring', icon: Brain },
      { href: '/audit', label: 'Audit log', icon: ScrollText },
    ],
  },
];

const AUTH_ROUTES = ['/login', '/invite'];

export function AdminShell({ children }: { children: React.ReactNode }) {
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
          'fixed inset-y-0 left-0 z-40 w-64 shrink-0 overflow-y-auto border-r border-line bg-paper-raised transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Admin navigation"
      >
        <div className="flex h-16 items-center gap-2 border-b border-line px-5">
          <AnveshMark className="text-laterite-600" />
          <Wordmark portal="Admin" />
        </div>
        <nav className="flex flex-col gap-4 p-3">
          {GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-0.5">
              <h2 className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                {group.title}
              </h2>
              {group.items.map((item) => {
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
            </div>
          ))}
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
                  {user?.profile.displayName} · {user?.role.toLowerCase()}
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