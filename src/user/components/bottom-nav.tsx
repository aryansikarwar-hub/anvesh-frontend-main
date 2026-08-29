'use client';

import { Compass, Home, Map as MapIcon, Sparkles, User } from 'lucide-react';
import { Link, usePathname } from '@/user/router';
import { cn } from '@/ui';

/** Raahi's mobile tab bar, with an elevated AI button riding above the rest. */
const ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/map', label: 'Map', icon: MapIcon },
  { href: '/dashboard', label: 'Profile', icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 glass md:hidden">
      <div className="relative mx-auto flex h-16 max-w-md items-center justify-around px-6">
        {ITEMS.slice(0, 2).map((item) => (
          <NavItem key={item.href} {...item} active={isActive(pathname, item.href)} />
        ))}

        <Link
          href="/ai"
          aria-label="AI Assistant"
          className="absolute -top-6 left-1/2 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift ring-4 ring-background transition-transform active:scale-95"
        >
          <Sparkles className="size-6" aria-hidden="true" />
        </Link>
        <span className="w-14" aria-hidden="true" />

        {ITEMS.slice(2).map((item) => (
          <NavItem key={item.href} {...item} active={isActive(pathname, item.href)} />
        ))}
      </div>
    </nav>
  );
}

function isActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn('flex w-14 flex-col items-center gap-0.5 py-1 text-muted-foreground', active && 'text-primary')}
    >
      <Icon className={cn('size-5', active && 'stroke-[2.5]')} aria-hidden="true" />
      <span className={cn('text-[10px] font-medium', active && 'font-bold')}>{label}</span>
    </Link>
  );
}