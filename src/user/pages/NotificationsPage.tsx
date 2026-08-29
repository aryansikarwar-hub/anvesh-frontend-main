'use client';

import { useState } from 'react';
import { Link } from '@/user/router';
import { Button, Card, CardContent, PageHeader, PageShell, Pagination } from '@/ui';
import { useMarkAllRead, useNotifications } from '@/user/hooks/use-personal';
import { QueryBoundary } from '@/user/components/query-boundary';
import { RequireAuth } from '@/user/components/require-auth';

export default function NotificationsPage() {
  return (
    <PageShell className="flex flex-col gap-6 py-8">
      <RequireAuth>
        <NotificationFeed />
      </RequireAuth>
    </PageShell>
  );
}

function NotificationFeed() {
  const [page, setPage] = useState(1);
  const notifications = useNotifications({ page });
  const markAll = useMarkAllRead();

  return (
    <>
      <PageHeader
        eyebrow="Yours"
        title="Notifications"
        description={
          notifications.data
            ? `${notifications.data.unreadCount} unread`
            : 'Booking, payment and review updates.'
        }
        actions={
          <Button
            variant="secondary"
            size="sm"
            loading={markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            Mark all read
          </Button>
        }
      />

      <QueryBoundary
        isLoading={notifications.isLoading}
        isError={notifications.isError}
        error={notifications.error}
        data={notifications.data}
        isEmpty={(data) => data.items.length === 0}
        onRetry={() => void notifications.refetch()}
        emptyTitle="Nothing to catch up on"
        emptyDescription="Booking confirmations, payment results and review activity land here."
        skeleton="rows"
      >
        {(data) => (
          <div className="flex flex-col gap-3">
            {data.items.map((notification) => (
              <Card
                key={notification.id}
                className={notification.readAt ? 'opacity-70' : 'border-laterite-200'}
              >
                <CardContent className="pt-5">
                  <h2 className="text-base font-semibold">{notification.title}</h2>
                  <p className="pt-1 text-sm text-ink-soft">{notification.body}</p>
                  <p className="pt-1 text-xs text-ink-faint">
                    {new Date(notification.createdAt).toLocaleString('en-IN')}
                  </p>
                  {notification.href ? (
                    <Link
                      href={notification.href}
                      className="pt-2 inline-block text-sm text-laterite-600 underline"
                    >
                      Open
                    </Link>
                  ) : null}
                </CardContent>
              </Card>
            ))}
            <Pagination pageInfo={data.pageInfo} onPageChange={setPage} />
          </div>
        )}
      </QueryBoundary>
    </>
  );
}