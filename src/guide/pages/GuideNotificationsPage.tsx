'use client';

import { useState } from 'react';
import { Card, CardContent, PageHeader, Pagination } from '@/ui';
import { useGuideNotifications } from '@/guide/hooks/use-guide';
import { QueryBoundary } from '@/guide/components/query-boundary';
import { RequireAuth } from '@/guide/components/require-auth';

export default function GuideNotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Moderation decisions, bookings and reviews."
      />
      <RequireAuth>
        <Feed />
      </RequireAuth>
    </div>
  );
}

function Feed() {
  const [page, setPage] = useState(1);
  const notifications = useGuideNotifications({ page });

  return (
    <QueryBoundary
      isLoading={notifications.isLoading}
      isError={notifications.isError}
      error={notifications.error}
      data={notifications.data}
      isEmpty={(data) => data.items.length === 0}
      onRetry={() => void notifications.refetch()}
      emptyTitle="Nothing here yet"
      emptyDescription="You will hear when a place is approved, a booking is made, or a review arrives."
      skeleton="rows"
    >
      {(data) => (
        <div className="flex flex-col gap-3">
          {data.items.map((notification) => (
            <Card key={notification.id} className={notification.readAt ? 'opacity-70' : ''}>
              <CardContent className="pt-5">
                <h2 className="text-base font-semibold">{notification.title}</h2>
                <p className="pt-1 text-sm text-ink-soft">{notification.body}</p>
                <p className="pt-1 text-xs text-ink-faint">
                  {new Date(notification.createdAt).toLocaleString('en-IN')}
                </p>
              </CardContent>
            </Card>
          ))}
          <Pagination pageInfo={data.pageInfo} onPageChange={setPage} />
        </div>
      )}
    </QueryBoundary>
  );
}