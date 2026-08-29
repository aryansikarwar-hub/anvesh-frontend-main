'use client';

import { useState } from 'react';
import { Button, Card, CardContent, Field, Input, PageHeader } from '@/ui';
import { useUpdatePayout } from '@/guide/hooks/use-guide';
import { RequireAuth } from '@/guide/components/require-auth';
import { describeError } from '@/guide/lib/api';

export default function PayoutsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Commerce"
        title="Payout details"
        description="Where Anvesh sends your share. The account number is encrypted at rest and only the last four digits are ever shown again."
      />
      <RequireAuth>
        <PayoutForm />
      </RequireAuth>
    </div>
  );
}

function PayoutForm() {
  const update = useUpdatePayout();
  const [form, setForm] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifsc: '',
    bankName: '',
    upiId: '',
  });

  return (
    <Card className="max-w-xl">
      <CardContent className="pt-5">
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            const payload: Record<string, string> = {
              accountHolderName: form.accountHolderName,
              accountNumber: form.accountNumber,
              ifsc: form.ifsc.toUpperCase(),
              bankName: form.bankName,
            };
            if (form.upiId) payload.upiId = form.upiId;
            update.mutate(payload, { onSuccess: () => setForm({ ...form, accountNumber: '' }) });
          }}
        >
          <Field label="Account holder name" htmlFor="payout-name" required>
            <Input
              id="payout-name"
              required
              minLength={2}
              value={form.accountHolderName}
              onChange={(event) => setForm({ ...form, accountHolderName: event.target.value })}
            />
          </Field>

          <Field label="Account number" htmlFor="payout-account" required>
            <Input
              id="payout-account"
              required
              inputMode="numeric"
              pattern="[0-9]{9,18}"
              value={form.accountNumber}
              onChange={(event) => setForm({ ...form, accountNumber: event.target.value })}
            />
          </Field>

          <Field label="IFSC" htmlFor="payout-ifsc" required hint="For example HDFC0001234.">
            <Input
              id="payout-ifsc"
              required
              value={form.ifsc}
              onChange={(event) => setForm({ ...form, ifsc: event.target.value })}
            />
          </Field>

          <Field label="Bank name" htmlFor="payout-bank" required>
            <Input
              id="payout-bank"
              required
              value={form.bankName}
              onChange={(event) => setForm({ ...form, bankName: event.target.value })}
            />
          </Field>

          <Field label="UPI id" htmlFor="payout-upi" hint="Optional.">
            <Input
              id="payout-upi"
              value={form.upiId}
              onChange={(event) => setForm({ ...form, upiId: event.target.value })}
              placeholder="name@bank"
            />
          </Field>

          {update.isError ? (
            <p role="alert" className="text-sm text-danger-500">
              {describeError(update.error).description}
            </p>
          ) : null}
          {update.isSuccess ? (
            <p role="status" className="text-sm text-ghat-500">
              Saved as {update.data.masked}. An admin verifies payout details before the first
              transfer.
            </p>
          ) : null}

          <div>
            <Button type="submit" loading={update.isPending}>
              Save payout details
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}