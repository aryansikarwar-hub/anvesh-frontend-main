'use client';

import { Link } from '@/guide/router';
import { usePathname } from '@/guide/router';
import { Button, EmptyState, LoadingState } from '@/ui';
import { useCurrentUser } from '@/guide/hooks/use-session';

/**
 * Client-side gate for personal pages. It is a convenience, not a security
 * boundary: every one of these screens loads data from endpoints the API
 * already refuses without a valid Tourist Guide token.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, status } = useCurrentUser();
  const pathname = usePathname();

  if (status === 'unknown') return <LoadingState rows={3} label="Checking your session" />;

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Sign in to continue"
        description="Sign in with your Tourist Guide account to continue."
        action={
          <Button asChild>
            <Link href={`/login?next=${encodeURIComponent(pathname)}`}>Sign in</Link>
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
}