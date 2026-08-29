'use client';

import { useState } from 'react';
import { useParams } from '@/guide/router';
import { Button, Card, CardContent, Field, Money, PageHeader, Textarea } from '@/ui';
import { useBookingAction, useGuideBooking } from '@/guide/hooks/use-guide';
import { QueryBoundary } from '@/guide/components/query-boundary';
import { RequireAuth } from '@/guide/components/require-auth';
import { GuideBookingStatus } from './GuideBookingsPage';
import { describeError } from '@/guide/lib/api';

export default function GuideBookingDetail() {
  const { id } = useParams() as { id: string };
  return (
    <RequireAuth>
      <BookingDetail id={id} />
    </RequireAuth>
  );
}

function BookingDetail({ id }: { id: string }) {
  const query = useGuideBooking(id);
  const action = useBookingAction();
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
          <PageHeader
            eyebrow={booking.code}
            title={booking.experienceTitle}
            description={new Date(booking.startAt).toLocaleString('en-IN', {
              dateStyle: 'full',
              timeStyle: 'short',
            })}
          />

          <GuideBookingStatus status={booking.status} />

          <Card>
            <CardContent className="pt-5">
              <h2 className="pb-3 text-lg">Your share</h2>
              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-muted">
                    {booking.amounts.seats} x <Money minor={booking.amounts.unitPriceMinor} />
                  </dt>
                  <dd>
                    <Money minor={booking.amounts.subtotalMinor} />
                  </dd>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <dt>Platform commission</dt>
                  <dd>
                    - <Money minor={booking.amounts.commissionMinor} />
                  </dd>
                </div>
                <div className="flex justify-between border-t border-line pt-2 font-semibold">
                  <dt>Payable to you</dt>
                  <dd>
                    <Money minor={booking.amounts.guidePayoutMinor} />
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
                  <li key={index} className="flex justify-between gap-4">
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
                <h2 className="pb-2 text-lg">Update this booking</h2>
                <p className="pb-3 text-sm text-ink-muted">
                  Mark it complete after the experience has finished, or cancel it if you cannot run
                  it. Cancelling returns the seats; refunds are issued by an admin.
                </p>
                <form className="flex flex-col gap-3">
                  <Field label="Note" htmlFor="action-reason">
                    <Textarea
                      id="action-reason"
                      maxLength={300}
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                    />
                  </Field>
                  {action.isError ? (
                    <p role="alert" className="text-sm text-danger-500">
                      {describeError(action.error).description}
                    </p>
                  ) : null}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      loading={action.isPending}
                      onClick={() => action.mutate({ id: booking.id, action: 'COMPLETE', reason })}
                    >
                      Mark completed
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      loading={action.isPending}
                      onClick={() => action.mutate({ id: booking.id, action: 'CANCEL', reason })}
                    >
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