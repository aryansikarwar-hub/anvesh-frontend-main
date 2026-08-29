'use client';

import { useState } from 'react';
import { Link } from '@/user/router';
import { useMutation } from '@tanstack/react-query';
import { Button, Field, Input } from '@/ui';
import { api, describeError } from '@/user/lib/api';
import { AuthShell } from '@/user/components/auth-shell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const request = useMutation({
    mutationFn: (value: string) =>
      api.post<{ sent: boolean }>('/auth/forgot-password', {
        email: value,
        portal: 'TRAVELLER',
      }),
  });

  return (
    <AuthShell
      title="Reset your password"
      description="We will email a link if the address has an account."
      footer={
        <Link href="/login" className="text-laterite-600 underline">
          Back to sign in
        </Link>
      }
    >
      {request.isSuccess ? (
        <p className="text-sm text-ink-soft">
          If that address has an Anvesh account, a reset link is on its way. The link expires in an
          hour.
        </p>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            request.mutate(email);
          }}
        >
          <Field label="Email" htmlFor="forgot-email" required>
            <Input
              id="forgot-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          {request.isError ? (
            <p role="alert" className="text-sm text-danger-500">
              {describeError(request.error).description}
            </p>
          ) : null}
          <Button type="submit" loading={request.isPending}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}