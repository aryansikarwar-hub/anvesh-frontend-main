'use client';

import { ErrorState, PageShell } from '@/ui';

/**
 * Last-resort screen for an error thrown while rendering a guide page.
 * Next's App Router convention: a client component named `error.tsx` that
 * receives the thrown error and a `reset` callback. This replaces the old
 * react-router-dom `errorElement` (`src/app-error.tsx`).
 */
export default function GuideError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <PageShell className="py-16">
      <ErrorState
        title="This page could not be shown"
        description={error.message || 'Something failed while rendering this page.'}
        onRetry={reset}
      />
    </PageShell>
  );
}
