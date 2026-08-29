'use client';

import { useState } from 'react';
import { useParams } from '@/user/router';
import { Link } from '@/user/router';
import { Button, Card, CardContent, Field, Money, PageShell, Textarea } from '@/ui';
import { useBooking, useCancelBooking } from '@/user/hooks/use-commerce';
import { QueryBoundary } from '@/user/components/query-boundary';
import { RequireAuth } from '@/user/components/require-auth';
import { BookingStatusBadge } from './BookingsPage';
import { describeError } from '@/user/lib/api';

export default function BookingPage() {
  const { id } = useParams() as { id: string };
  return (
    <PageShell className="py-8">
      <RequireAuth>
        <BookingDetail bookingId={id} />
      </RequireAuth>
    </PageShell>
  );
}

function BookingDetail({ bookingId }: { bookingId: string }) {
  const query = useBooking(bookingId);
  const cancel = useCancelBooking();
  const [reason, setReason] = useState('');

  return (
    <QueryBoundary
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      data={query.data}
      onRetry={() => void query.refetch()}
      skeleton="rows"
    >
      {({ booking }) => (
        <div className="flex max-w-3xl flex-col gap-6">
          <header className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <BookingStatusBadge status={booking.status} />
              <span className="font-mono text-sm text-ink-faint">{booking.code}</span>
            </div>
            <h1 className="text-2xl">
              <Link href={`/experiences/${booking.experienceSlug}`} className="hover:underline">
                {booking.experienceTitle}
              </Link>
            </h1>
            <p className="text-ink-muted">
              {new Date(booking.startAt).toLocaleString('en-IN', {
                dateStyle: 'full',
                timeStyle: 'short',
              })}
            </p>
            <p className="text-sm text-ink-muted">
              Guided by{' '}
              <Link
                href={`/guides/${booking.guideSummary.slug}`}
                className="text-laterite-600 underline"
              >
                {booking.guideSummary.displayName}
              </Link>
            </p>
          </header>

          <Card>
            <CardContent className="pt-5">
              <h2 className="pb-3 text-lg">What you paid</h2>
              <dl className="flex flex-col gap-2 text-sm">
                <Row
                  label={`${booking.amounts.seats} x seat`}
                  value={<Money minor={booking.amounts.subtotalMinor} />}
                />
                <Row
                  label="Platform fee"
                  value={<Money minor={booking.amounts.feeMinor} />}
                  muted
                />
                <Row label="Tax on fee" value={<Money minor={booking.amounts.taxMinor} />} muted />
                <div className="flex justify-between border-t border-line pt-2 font-semibold">
                  <dt>Total</dt>
                  <dd>
                    <Money minor={booking.amounts.totalMinor} />
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <h2 className="pb-3 text-lg">History</h2>
              <ol className="flex flex-col gap-2 text-sm">
                {booking.timeline.map((entry, index) => (
                  <li key={`${entry.status}-${index}`} className="flex justify-between gap-4">
                    <span>{entry.status.replace(/_/g, ' ').toLowerCase()}</span>
                    <span className="text-ink-faint">
                      {new Date(entry.at).toLocaleString('en-IN')}
                      {entry.reason ? ` · ${entry.reason}` : ''}
                    </span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {booking.status === 'CONFIRMED' ? (
            <Card>
              <CardContent className="pt-5">
                <h2 className="pb-2 text-lg">Cancel this booking</h2>
                <p className="pb-3 text-sm text-ink-muted">
                  Cancellation is not possible within 24 hours of the start time. Refunds are issued
                  by an admin against the original payment.
                </p>
                <form
                  className="flex flex-col gap-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    cancel.mutate({ id: booking.id, reason });
                  }}
                >
                  <Field label="Reason" htmlFor="cancel-reason" required>
                    <Textarea
                      id="cancel-reason"
                      required
                      minLength={3}
                      maxLength={300}
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                    />
                  </Field>
                  {cancel.isError ? (
                    <p role="alert" className="text-sm text-danger-500">
                      {describeError(cancel.error).description}
                    </p>
                  ) : null}
                  <div>
                    <Button type="submit" variant="danger" loading={cancel.isPending}>
                      Cancel booking
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </QueryBoundary>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className={muted ? 'text-ink-muted' : ''}>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}