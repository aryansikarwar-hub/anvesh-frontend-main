'use client';

import { Suspense, useState } from 'react';
import { Link } from '@/admin/router';
import { useSearchParams } from '@/admin/router';
import { useMutation } from '@tanstack/react-query';
import { Button, Field, Input, LoadingState } from '@/ui';
import { api, describeError } from '@/admin/lib/api';
import { AuthShell } from '@/admin/components/auth-shell';

function AcceptInvite() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [form, setForm] = useState({ displayName: '', password: '' });
  const accept = useMutation({
    mutationFn: (input: { displayName: string; password: string }) =>
      api.post<{ accepted: boolean }>('/admin-auth/invites/accept', { token, ...input }),
  });

  if (!token) {
    return <p className="text-sm text-danger-500">This invitation link is missing its token.</p>;
  }

  if (accept.isSuccess) {
    return (
      <div className="flex flex-col gap-3 text-sm">
        <p>Your admin account is ready. Signing in will ask you to enrol an authenticator app.</p>
        <Button asChild>
          <Link href="/login">Go to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        accept.mutate(form);
      }}
    >
      <Field label="Your name" htmlFor="invite-name" required>
        <Input
          id="invite-name"
          required
          minLength={2}
          maxLength={80}
          value={form.displayName}
          onChange={(event) => setForm({ ...form, displayName: event.target.value })}
        />
      </Field>
      <Field
        label="Password"
        htmlFor="invite-password"
        required
        hint="At least 10 characters, with an uppercase letter, a lowercase letter and a digit."
      >
        <Input
          id="invite-password"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />
      </Field>
      {accept.isError ? (
        <p role="alert" className="text-sm text-danger-500">
          {describeError(accept.error).description}
        </p>
      ) : null}
      <Button type="submit" loading={accept.isPending}>
        Accept invitation
      </Button>
    </form>
  );
}

export default function InvitePage() {
  return (
    <AuthShell
      title="Accept your invitation"
      description="Admin accounts cannot be self-created; this link was issued by an existing admin."
    >
      <Suspense fallback={<LoadingState rows={2} />}>
        <AcceptInvite />
      </Suspense>
    </AuthShell>
  );
}