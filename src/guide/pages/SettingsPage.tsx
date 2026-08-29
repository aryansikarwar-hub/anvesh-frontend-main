'use client';

import { useState } from 'react';
import { Link } from '@/guide/router';
import { useMutation } from '@tanstack/react-query';
import { Button, Card, CardContent, Field, Input, PageHeader } from '@/ui';
import { api, describeError } from '@/guide/lib/api';
import { useCurrentUser } from '@/guide/hooks/use-session';
import { RequireAuth } from '@/guide/components/require-auth';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Account" title="Settings" description="Your sign-in details." />
      <RequireAuth>
        <Settings />
      </RequireAuth>
    </div>
  );
}

function Settings() {
  const { user } = useCurrentUser();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const change = useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      api.post<{ changed: boolean }>('/auth/change-password', input),
  });

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <Card>
        <CardContent className="pt-5 text-sm">
          <h2 className="pb-2 text-lg">Account</h2>
          <p className="text-ink-muted">
            Signed in as {user?.email}
            {user?.emailVerified ? '' : ' (email not verified)'}
          </p>
          <p className="pt-2 text-ink-muted">
            Your traveller profile is separate and lives on{' '}
            <Link href="/" className="text-laterite-600 underline">
              anvesh.travel
            </Link>
            .
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <h2 className="pb-3 text-lg">Change password</h2>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              change.mutate(form, {
                onSuccess: () => setForm({ currentPassword: '', newPassword: '' }),
              });
            }}
          >
            <Field label="Current password" htmlFor="current-password" required>
              <Input
                id="current-password"
                type="password"
                required
                autoComplete="current-password"
                value={form.currentPassword}
                onChange={(event) => setForm({ ...form, currentPassword: event.target.value })}
              />
            </Field>
            <Field
              label="New password"
              htmlFor="new-password"
              required
              hint="At least 10 characters, with an uppercase letter, a lowercase letter and a digit."
            >
              <Input
                id="new-password"
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                value={form.newPassword}
                onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
              />
            </Field>
            {change.isError ? (
              <p role="alert" className="text-sm text-danger-500">
                {describeError(change.error).description}
              </p>
            ) : null}
            {change.isSuccess ? (
              <p role="status" className="text-sm text-ghat-500">
                Password changed. Every other session was signed out.
              </p>
            ) : null}
            <div>
              <Button type="submit" loading={change.isPending}>
                Change password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}