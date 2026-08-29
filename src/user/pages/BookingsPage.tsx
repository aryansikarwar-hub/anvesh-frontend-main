'use client';

import { useState } from 'react';
import { Link } from '@/user/router';
import { Badge, Card, CardContent, Money, PageHeader, PageShell, Pagination } from '@/ui';
import { type BookingStatus } from '@/lib/types';
import { useBookings } from '@/user/hooks/use-commerce';
import { QueryBoundary } from '@/user/components/query-boundary';
import { RequireAuth } from '@/user/components/require-auth';

const STATUS_VARIANT: Record<string, 'neutral' | 'success' | 'warn' | 'danger'> = {
  PENDING_PAYMENT: 'warn',
  CONFIRMED: 'success',
  COMPLETED: 'success',
  EXPIRED: 'neutral',
  CANCELLED_BY_USER: 'danger',
  CANCELLED_BY_GUIDE: 'danger',
  REFUNDED: 'neutral',
  PARTIALLY_REFUNDED: 'neutral',
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status] ?? 'neutral'}>
      {status.replace(/_/g, ' ').toLowerCase()}
    </Badge>
  );
}

export default function BookingsPage() {
  return (
    <PageShell className="flex flex-col gap-6 py-8">
      <PageHeader eyebrow="Yours" title="Bookings" description="Everything you have booked." />
      <RequireAuth>
        <BookingsList />
      </RequireAuth>
    </PageShell>
  );
}

function BookingsList() {
  const [page, setPage] = useState(1);
  const bookings = useBookings({ page });

  return (
    <QueryBoundary
      isLoading={bookings.isLoading}
      isError={bookings.isError}
      error={bookings.error}
      data={bookings.data}
      isEmpty={(data) => data.items.length === 0}
      onRetry={() => void bookings.refetch()}
      emptyTitle="No bookings yet"
      emptyDescription="When you book an experience it appears here with its payment status."
      skeleton="rows"
    >
      {(data) => (
        <div className="flex flex-col gap-3">
          {data.items.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-5">
                <div>
                  <div className="flex items-center gap-2">
                    <BookingStatusBadge status={booking.status} />
                    <span className="font-mono text-xs text-ink-faint">{booking.code}</span>
                  </div>
                  <h2 className="pt-1 text-base">
                    <Link href={`/bookings/${booking.id}`} className="hover:underline">
                      {booking.experienceTitle}
                    </Link>
                  </h2>
                  <p className="pt-0.5 text-sm text-ink-muted">
                    {new Date(booking.startAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}{' '}
                    · {booking.amounts.seats} seat{booking.amounts.seats === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="text-right">
                  <Money minor={booking.amounts.totalMinor} className="font-display text-lg" />
                  {booking.status === 'PENDING_PAYMENT' ? (
                    <p className="pt-1 text-xs">
                      <Link href={`/checkout/${booking.id}`} className="text-laterite-600 underline">
                        Complete payment
                      </Link>
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
          <Pagination pageInfo={data.pageInfo} onPageChange={setPage} />
        </div>
      )}
    </QueryBoundary>
  );
}