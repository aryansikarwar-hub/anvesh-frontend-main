'use client';

import { useEffect, useState } from 'react';
import { useParams } from '@/user/router';
import { Link } from '@/user/router';
import { useRouter } from '@/user/router';
import { ShieldCheck } from 'lucide-react';
import { Button, Card, CardContent, Money, PageHeader, PageShell } from '@/ui';
import { type CheckoutIntent } from '@/lib/types';
import { useBooking, useCreateOrder, useVerifyPayment } from '@/user/hooks/use-commerce';
import { QueryBoundary } from '@/user/components/query-boundary';
import { RequireAuth } from '@/user/components/require-auth';
import { describeError } from '@/user/lib/api';
import { loadRazorpayCheckout, openRazorpayCheckout } from '@/user/lib/razorpay';

export default function CheckoutPage() {
  const { bookingId } = useParams() as { bookingId: string };
  return (
    <PageShell className="flex flex-col gap-6 py-8">
      <PageHeader
        eyebrow="Checkout"
        title="Complete your booking"
        description="Payment is taken by Razorpay. Anvesh only confirms a booking after verifying the signature server-side."
      />
      <RequireAuth>
        <Checkout bookingId={bookingId} />
      </RequireAuth>
    </PageShell>
  );
}

function Checkout({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const booking = useBooking(bookingId);
  const createOrder = useCreateOrder();
  const verify = useVerifyPayment();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadRazorpayCheckout();
  }, []);

  async function pay(intent: CheckoutIntent) {
    setMessage(null);
    try {
      const result = await openRazorpayCheckout(intent);
      if (!result) {
        setMessage('The payment window was closed before the payment finished.');
        return;
      }
      await verify.mutateAsync({
        bookingId,
        razorpayOrderId: result.razorpay_order_id,
        razorpayPaymentId: result.razorpay_payment_id,
        razorpaySignature: result.razorpay_signature,
      });
      router.push(`/payments/${bookingId}/status`);
    } catch (error) {
      setMessage(describeError(error).description);
    }
  }

  return (
    <QueryBoundary
      isLoading={booking.isLoading}
      isError={booking.isError}
      error={booking.error}
      data={booking.data}
      onRetry={() => void booking.refetch()}
      skeleton="rows"
    >
      {({ booking: data }) => {
        if (data.status !== 'PENDING_PAYMENT') {
          return (
            <Card>
              <CardContent className="flex flex-col gap-3 pt-5">
                <h2 className="text-lg">This booking is not awaiting payment</h2>
                <p className="text-sm text-ink-muted">
                  Its status is {data.status.replace(/_/g, ' ').toLowerCase()}.
                </p>
                <div>
                  <Button asChild variant="secondary">
                    <Link href={`/bookings/${data.id}`}>View booking</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        }

        return (
          <div className="grid max-w-4xl gap-6 lg:grid-cols-[1fr_320px]">
            <Card>
              <CardContent className="flex flex-col gap-4 pt-5">
                <div>
                  <h2 className="text-lg">{data.experienceTitle}</h2>
                  <p className="pt-1 text-sm text-ink-muted">
                    {new Date(data.startAt).toLocaleString('en-IN', {
                      dateStyle: 'full',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>

                <dl className="flex flex-col gap-2 border-t border-line pt-3 text-sm">
                  <div className="flex justify-between">
                    <dt>
                      {data.amounts.seats} x <Money minor={data.amounts.unitPriceMinor} />
                    </dt>
                    <dd>
                      <Money minor={data.amounts.subtotalMinor} />
                    </dd>
                  </div>
                  <div className="flex justify-between text-ink-muted">
                    <dt>Platform fee</dt>
                    <dd>
                      <Money minor={data.amounts.feeMinor} />
                    </dd>
                  </div>
                  <div className="flex justify-between text-ink-muted">
                    <dt>Tax on fee</dt>
                    <dd>
                      <Money minor={data.amounts.taxMinor} />
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-line pt-2 font-semibold">
                    <dt>Total</dt>
                    <dd>
                      <Money minor={data.amounts.totalMinor} />
                    </dd>
                  </div>
                </dl>

                {data.expiresAt ? (
                  <p className="text-xs text-ink-faint">
                    Seats are held until{' '}
                    {new Date(data.expiresAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    , then released automatically.
                  </p>
                ) : null}

                {createOrder.isError ? (
                  <p role="alert" className="text-sm text-danger-500">
                    {describeError(createOrder.error).description}
                  </p>
                ) : null}
                {message ? (
                  <p role="alert" className="text-sm text-danger-500">
                    {message}
                  </p>
                ) : null}

                <div>
                  {createOrder.data ? (
                    <Button loading={verify.isPending} onClick={() => void pay(createOrder.data.checkout)}>
                      Open Razorpay checkout
                    </Button>
                  ) : (
                    <Button
                      loading={createOrder.isPending}
                      onClick={() => createOrder.mutate(bookingId)}
                    >
                      Continue to payment
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardContent className="flex flex-col gap-2 pt-5 text-sm text-ink-muted">
                <ShieldCheck className="size-5 text-ghat-500" aria-hidden="true" />
                <p className="font-medium text-ink">How the payment is verified</p>
                <p>
                  The browser never decides whether a payment succeeded. Razorpay returns a
                  signature, Anvesh recomputes the same HMAC on the server with its secret, checks
                  the amount against the provider, and only then confirms the booking.
                </p>
              </CardContent>
            </Card>
          </div>
        );
      }}
    </QueryBoundary>
  );
}