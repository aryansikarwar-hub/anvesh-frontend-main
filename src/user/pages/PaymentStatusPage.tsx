'use client';

import { Link } from '@/user/router';
import { useParams } from '@/user/router';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Button, Card, CardContent, LoadingState, Money, PageShell } from '@/ui';
import { useBooking, usePaymentByBooking } from '@/user/hooks/use-commerce';
import { RequireAuth } from '@/user/components/require-auth';
import { describeError } from '@/user/lib/api';

export default function PaymentStatusPage() {
  const { bookingId } = useParams() as { bookingId: string };
  return (
    <PageShell className="py-12">
      <RequireAuth>
        <Status bookingId={bookingId} />
      </RequireAuth>
    </PageShell>
  );
}

function Status({ bookingId }: { bookingId: string }) {
  const booking = useBooking(bookingId);
  const payment = usePaymentByBooking(bookingId);

  if (booking.isLoading) return <LoadingState rows={2} label="Checking your payment" />;
  if (booking.isError) {
    return (
      <Card>
        <CardContent className="pt-5 text-sm text-danger-500">
          {describeError(booking.error).description}
        </CardContent>
      </Card>
    );
  }

  const data = booking.data?.booking;
  if (!data) return null;

  const captured = payment.data?.payment.status === 'CAPTURED';
  const confirmed = data.status === 'CONFIRMED' || data.status === 'COMPLETED';

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
      {confirmed && captured ? (
        <CheckCircle2 className="size-12 text-ghat-500" aria-hidden="true" />
      ) : data.status === 'PENDING_PAYMENT' ? (
        <Clock className="size-12 text-gold-500" aria-hidden="true" />
      ) : (
        <XCircle className="size-12 text-danger-500" aria-hidden="true" />
      )}

      <h1 className="text-2xl">
        {confirmed && captured
          ? 'Booking confirmed'
          : data.status === 'PENDING_PAYMENT'
            ? 'Payment not completed yet'
            : `Booking ${data.status.replace(/_/g, ' ').toLowerCase()}`}
      </h1>

      <p className="text-ink-muted">
        {confirmed && captured
          ? `Reference ${data.code}. A confirmation email is on its way.`
          : data.status === 'PENDING_PAYMENT'
            ? 'We have not received a verified payment for this booking. The seats stay held until the hold expires.'
            : 'This booking is no longer active.'}
      </p>

      <p className="text-sm">
        <Money minor={data.amounts.totalMinor} /> · {data.experienceTitle}
      </p>

      <div className="flex gap-2 pt-2">
        <Button asChild variant="secondary">
          <Link href={`/bookings/${data.id}`}>View booking</Link>
        </Button>
        {data.status === 'PENDING_PAYMENT' ? (
          <Button asChild>
            <Link href={`/checkout/${data.id}`}>Try payment again</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/explore">Keep exploring</Link>
          </Button>
        )}
      </div>
    </div>
  );
}