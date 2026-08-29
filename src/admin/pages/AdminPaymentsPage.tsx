'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Field,
  Input,
  Money,
  PageHeader,
  Pagination,
  Select,
  Textarea,
} from '@/ui';
import { PAYMENT_STATUSES, type Payment } from '@/lib/types';
import { useAdminPayments, useRefund } from '@/admin/hooks/use-admin';
import { QueryBoundary } from '@/admin/components/query-boundary';
import { RequireAuth } from '@/admin/components/require-auth';
import { DataTable } from '@/admin/components/data-table';
import { describeError } from '@/admin/lib/api';

export default function AdminPaymentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Commerce"
        title="Payments and refunds"
        description="Refund amounts are recomputed on the server and can never exceed what was captured."
      />
      <RequireAuth>
        <PaymentsPanel />
      </RequireAuth>
    </div>
  );
}

function PaymentsPanel() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const payments = useAdminPayments({ page, ...(status ? { status } : {}) });
  const refund = useRefund();
  const [form, setForm] = useState({ bookingId: '', amountRupees: '', reason: '' });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-4">
        <div className="max-w-xs">
          <label htmlFor="payment-status" className="text-sm font-medium text-ink-soft">
            Status
          </label>
          <Select
            id="payment-status"
            className="mt-1"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {PAYMENT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value.replace(/_/g, ' ').toLowerCase()}
              </option>
            ))}
          </Select>
        </div>

        <QueryBoundary
          isLoading={payments.isLoading}
          isError={payments.isError}
          error={payments.error}
          data={payments.data}
          isEmpty={(data) => data.items.length === 0}
          onRetry={() => void payments.refetch()}
          emptyTitle="No payments"
          emptyDescription="Nothing matches that status."
          skeleton="rows"
        >
          {(data) => (
            <div className="flex flex-col gap-4">
              <DataTable<Payment>
                caption="Payments"
                rows={data.items}
                rowKey={(payment) => payment.id}
                columns={[
                  {
                    key: 'order',
                    header: 'Order',
                    render: (payment) => (
                      <div>
                        <p className="font-mono text-xs">{payment.providerOrderId}</p>
                        <p className="pt-0.5 font-mono text-xs text-ink-faint">
                          booking {payment.bookingId}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: 'amount',
                    header: 'Amount',
                    numeric: true,
                    align: 'right',
                    render: (payment) => <Money minor={payment.amountMinor} />,
                  },
                  {
                    key: 'refunds',
                    header: 'Refunded',
                    numeric: true,
                    align: 'right',
                    render: (payment) => (
                      <Money
                        minor={payment.refunds.reduce((sum, entry) => sum + entry.amountMinor, 0)}
                      />
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (payment) => (
                      <Badge
                        variant={
                          payment.status === 'CAPTURED'
                            ? 'success'
                            : payment.status === 'FAILED'
                              ? 'danger'
                              : 'neutral'
                        }
                      >
                        {payment.status.replace(/_/g, ' ').toLowerCase()}
                      </Badge>
                    ),
                  },
                  {
                    key: 'actions',
                    header: '',
                    align: 'right',
                    render: (payment) => (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setForm({ ...form, bookingId: payment.bookingId })}
                      >
                        Refund
                      </Button>
                    ),
                  },
                ]}
              />
              <Pagination pageInfo={data.pageInfo} onPageChange={setPage} />
            </div>
          )}
        </QueryBoundary>
      </div>

      <Card className="h-fit">
        <CardContent className="pt-5">
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              refund.mutate({
                bookingId: form.bookingId,
                ...(form.amountRupees
                  ? { amountMinor: Math.round(Number(form.amountRupees) * 100) }
                  : {}),
                reason: form.reason,
              });
            }}
          >
            <h2 className="text-lg">Issue a refund</h2>
            <Field label="Booking id" htmlFor="refund-booking" required>
              <Input
                id="refund-booking"
                required
                value={form.bookingId}
                onChange={(event) => setForm({ ...form, bookingId: event.target.value })}
              />
            </Field>
            <Field
              label="Amount (rupees)"
              htmlFor="refund-amount"
              hint="Leave blank to refund everything still refundable."
            >
              <Input
                id="refund-amount"
                type="number"
                min={0}
                value={form.amountRupees}
                onChange={(event) => setForm({ ...form, amountRupees: event.target.value })}
              />
            </Field>
            <Field label="Reason" htmlFor="refund-reason" required>
              <Textarea
                id="refund-reason"
                required
                minLength={3}
                maxLength={300}
                value={form.reason}
                onChange={(event) => setForm({ ...form, reason: event.target.value })}
              />
            </Field>
            {refund.isError ? (
              <p role="alert" className="text-sm text-danger-500">
                {describeError(refund.error).description}
              </p>
            ) : null}
            {refund.isSuccess ? (
              <p role="status" className="text-sm text-ghat-500">
                Refund submitted to the provider.
              </p>
            ) : null}
            <Button type="submit" variant="danger" loading={refund.isPending}>
              Refund
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}