'use client';

import { useState } from 'react';
import { Badge, Money, PageHeader, Pagination, Select } from '@/ui';
import { BOOKING_STATUSES, type Booking } from '@/lib/types';
import { useAdminBookings } from '@/admin/hooks/use-admin';
import { QueryBoundary } from '@/admin/components/query-boundary';
import { RequireAuth } from '@/admin/components/require-auth';
import { DataTable } from '@/admin/components/data-table';

export default function AdminBookingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Commerce"
        title="Bookings"
        description="Every booking on the platform, with the state machine's current position."
      />
      <RequireAuth>
        <BookingsTable />
      </RequireAuth>
    </div>
  );
}

function BookingsTable() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const bookings = useAdminBookings({ page, ...(status ? { status } : {}) });

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-xs">
        <label htmlFor="booking-status" className="text-sm font-medium text-ink-soft">
          Status
        </label>
        <Select
          id="booking-status"
          className="mt-1"
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
        emptyTitle="No bookings"
        emptyDescription="Nothing matches that status."
        skeleton="rows"
      >
        {(data) => (
          <div className="flex flex-col gap-4">
            <DataTable<Booking>
              caption="All bookings"
              rows={data.items}
              rowKey={(booking) => booking.id}
              columns={[
                {
                  key: 'code',
                  header: 'Reference',
                  render: (booking) => (
                    <div>
                      <p className="font-mono text-xs">{booking.code}</p>
                      <p className="pt-0.5 text-xs text-ink-muted">{booking.experienceTitle}</p>
                    </div>
                  ),
                },
                {
                  key: 'when',
                  header: 'When',
                  render: (booking) => (
                    <span className="text-xs">
                      {new Date(booking.startAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  ),
                },
                {
                  key: 'seats',
                  header: 'Seats',
                  numeric: true,
                  align: 'right',
                  render: (booking) => booking.amounts.seats,
                },
                {
                  key: 'total',
                  header: 'Total',
                  numeric: true,
                  align: 'right',
                  render: (booking) => <Money minor={booking.amounts.totalMinor} />,
                },
                {
                  key: 'commission',
                  header: 'Commission',
                  numeric: true,
                  align: 'right',
                  render: (booking) => <Money minor={booking.amounts.commissionMinor} />,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (booking) => (
                    <Badge
                      variant={
                        booking.status === 'CONFIRMED' || booking.status === 'COMPLETED'
                          ? 'success'
                          : booking.status === 'PENDING_PAYMENT'
                            ? 'warn'
                            : 'neutral'
                      }
                    >
                      {booking.status.replace(/_/g, ' ').toLowerCase()}
                    </Badge>
                  ),
                },
              ]}
            />
            <Pagination pageInfo={data.pageInfo} onPageChange={setPage} />
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}