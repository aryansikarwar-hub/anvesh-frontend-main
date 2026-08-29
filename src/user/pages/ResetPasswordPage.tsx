'use client';

import { Suspense, useState } from 'react';
import { Link } from '@/user/router';
import { useSearchParams } from '@/user/router';
import { useMutation } from '@tanstack/react-query';
import { Button, Field, Input, LoadingState } from '@/ui';
import { api, describeError } from '@/user/lib/api';
import { AuthShell } from '@/user/components/auth-shell';

function ResetForm() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const reset = useMutation({
    mutationFn: (value: string) =>
      api.post<{ reset: boolean }>('/auth/reset-password', { token, password: value }),
  });

  if (!token) {
    return (
      <p className="text-sm text-danger-500">
        This link is missing its token. Request a new reset email.
      </p>
    );
  }

  if (reset.isSuccess) {
    return (
      <div className="flex flex-col gap-3 text-sm">
        <p>Your password has been changed and every existing session was signed out.</p>
        <Button asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        reset.mutate(password);
      }}
    >
      <Field
        label="New password"
        htmlFor="reset-password"
        required
        hint="At least 10 characters, with an uppercase letter, a lowercase letter and a digit."
      >
        <Input
          id="reset-password"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field>
      {reset.isError ? (
        <p role="alert" className="text-sm text-danger-500">
          {describeError(reset.error).description}
        </p>
      ) : null}
      <Button type="submit" loading={reset.isPending}>
        Set new password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Choose a new password" description="The reset link is valid once.">
      <Suspense fallback={<LoadingState rows={2} />}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}