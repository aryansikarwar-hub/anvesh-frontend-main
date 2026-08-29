'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@/admin/lib/api';
import { useAdminSessionBootstrap } from '@/admin/hooks/use-admin-session';

function SessionBootstrap({ children }: { children: React.ReactNode }) {
  useAdminSessionBootstrap();
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry(failureCount, error) {
              // Retrying a 4xx just repeats the same rejection.
              if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
                return false;
              }
              return failureCount < 2;
            },
          },
          mutations: { retry: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <SessionBootstrap>{children}</SessionBootstrap>
    </QueryClientProvider>
  );
}