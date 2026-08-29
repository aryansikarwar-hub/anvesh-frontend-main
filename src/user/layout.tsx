'use client';

import { Providers } from '@/user/providers';
import { SiteHeader } from '@/user/components/site-header';
import { SiteFooter } from '@/user/components/site-footer';
import { BottomNav } from '@/user/components/bottom-nav';
import { AiChatWidget } from '@/user/components/ai-chat-widget';

/**
 * The traveller portal's frame: header, page, footer.
 *
 * `Providers` sets up React Query and restores the session, and lives here
 * rather than at the app root so each portal keeps its own cache and its own
 * signed-in user.
 *
 * Rendered from `app/(traveller)/layout.tsx`, which is the Next App Router
 * file that actually owns this route group — this component just takes
 * `children` instead of a react-router-dom `<Outlet />` so the markup itself
 * didn't need to change.
 */
export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-paper-raised focus:px-3 focus:py-2 focus:shadow-lift"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1 pb-20 md:pb-6">
          {children}
        </main>
        <SiteFooter />
        <BottomNav />
        <AiChatWidget />
      </div>
    </Providers>
  );
}
