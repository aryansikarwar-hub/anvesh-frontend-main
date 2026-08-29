'use client';

import { useState } from 'react';
import { Link } from '@/guide/router';
import { Badge, Card, CardContent, Money, PageHeader, Pagination, Select } from '@/ui';
import { BOOKING_STATUSES, type BookingStatus } from '@/lib/types';
import { useGuideBookings } from '@/guide/hooks/use-guide';
import { QueryBoundary } from '@/guide/components/query-boundary';
import { RequireAuth } from '@/guide/components/require-auth';

const VARIANT: Partial<Record<BookingStatus, 'neutral' | 'success' | 'warn' | 'danger'>> = {
  PENDING_PAYMENT: 'warn',
  CONFIRMED: 'success',
  COMPLETED: 'success',
  CANCELLED_BY_USER: 'danger',
  CANCELLED_BY_GUIDE: 'danger',
};

export function GuideBookingStatus({ status }: { status: BookingStatus }) {
  return (
    <Badge variant={VARIANT[status] ?? 'neutral'}>{status.replace(/_/g, ' ').toLowerCase()}</Badge>
  );
}

export default function GuideBookingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Commerce"
        title="Bookings"
        description="Only bookings on your own experiences. The API scopes this by your guide id, not by the URL."
      />
      <RequireAuth>
        <BookingsList />
      </RequireAuth>
    </div>
  );
}

function BookingsList() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const bookings = useGuideBookings({ page, ...(status ? { status } : {}) });

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-xs">
        <label htmlFor="booking-status" className="sr-only">
          Filter by status
        </label>
        <Select
          id="booking-status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {BOOKING_STATUSES.map((value) => (
            <option key={value} value={value}>
              {value.replace(/_/g, ' ').toLowerCase()}
            </option>
          ))}
        </Select>
      </div>

      <QueryBoundary
        isLoading={bookings.isLoading}
        isError={bookings.isError}
        error={bookings.error}
        data={bookings.data}
        isEmpty={(data) => data.items.length === 0}
        onRetry={() => void bookings.refetch()}
        emptyTitle="No bookings yet"
        emptyDescription="Once an experience is published and has open slots, bookings appear here."
        skeleton="rows"
      >
        {(data) => (
          <div className="flex flex-col gap-3">
            {data.items.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <GuideBookingStatus status={booking.status} />
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
                    <Money
                      minor={booking.amounts.guidePayoutMinor}
                      className="font-display text-lg"
                    />
                    <p className="text-xs text-ink-faint">your share after commission</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Pagination pageInfo={data.pageInfo} onPageChange={setPage} />
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}