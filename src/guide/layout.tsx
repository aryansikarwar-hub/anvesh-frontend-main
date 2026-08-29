'use client';

import { Providers } from '@/guide/providers';
import { GuideShell } from '@/guide/components/guide-shell';

/**
 * The tourist guide portal's frame, mounted under /guide.
 *
 * Rendered from `app/guide/layout.tsx`; see `@/user/layout` for why this
 * takes `children` instead of a react-router-dom `<Outlet />`.
 */
export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-paper-raised focus:px-3 focus:py-2 focus:shadow-lift"
        >
          Skip to content
        </a>
        <GuideShell>{children}</GuideShell>
      </div>
    </Providers>
  );
}
