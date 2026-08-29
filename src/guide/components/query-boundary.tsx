'use client';

import { CardGridSkeleton, EmptyState, ErrorState, LoadingState } from '@/ui';
import { describeError } from '@/guide/lib/api';

export interface QueryBoundaryProps<T> {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  data: T | undefined;
  isEmpty?: (data: T) => boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  skeleton?: 'cards' | 'rows';
  children: (data: T) => React.ReactNode;
}

/**
 * Every list and detail screen in the app renders through this, which is how
 * loading, error and empty states stay consistent instead of being invented
 * per page. The error state surfaces the server's request id.
 */
export function QueryBoundary<T>({
  isLoading,
  isError,
  error,
  data,
  isEmpty,
  onRetry,
  emptyTitle = 'Nothing here yet',
  emptyDescription = 'There is nothing to show for this view right now.',
  emptyAction,
  skeleton = 'cards',
  children,
}: QueryBoundaryProps<T>) {
  if (isLoading) {
    return skeleton === 'cards' ? <CardGridSkeleton /> : <LoadingState />;
  }

  if (isError) {
    const described = describeError(error);
    return (
      <ErrorState
        title={described.title}
        description={described.description}
        {...(described.code ? { code: described.code } : {})}
        {...(described.requestId ? { requestId: described.requestId } : {})}
        {...(onRetry ? { onRetry } : {})}
      />
    );
  }

  if (data === undefined) {
    return <ErrorState title="No data" description="The server returned nothing for this view." />;
  }

  if (isEmpty?.(data)) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
    );
  }

  return <>{children(data)}</>;
}