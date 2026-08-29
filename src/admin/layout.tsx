'use client';

import { Providers } from '@/admin/providers';
import { AdminShell } from '@/admin/components/admin-shell';

/**
 * The staff portal's frame, mounted under /admin.
 *
 * Rendered from `app/admin/layout.tsx`; see `@/user/layout` for why this
 * takes `children` instead of a react-router-dom `<Outlet />`.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-paper-raised focus:px-3 focus:py-2 focus:shadow-lift"
        >
          Skip to content
        </a>
        <AdminShell>{children}</AdminShell>
      </div>
    </Providers>
  );
}
