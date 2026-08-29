'use client';

import { useState } from 'react';
import { Button, Card, CardContent, Field, Input, PageHeader, PageShell, Textarea } from '@/ui';
import { useUpdateProfile } from '@/user/hooks/use-personal';
import { useCurrentUser } from '@/user/hooks/use-session';
import { RequireAuth } from '@/user/components/require-auth';
import { describeError } from '@/user/lib/api';

export default function ProfilePage() {
  return (
    <PageShell className="flex flex-col gap-6 py-8">
      <PageHeader eyebrow="Account" title="Profile" description="How you appear on reviews." />
      <RequireAuth>
        <ProfileForm />
      </RequireAuth>
    </PageShell>
  );
}

function ProfileForm() {
  const { user } = useCurrentUser();
  const update = useUpdateProfile();
  const [form, setForm] = useState({
    displayName: user?.profile.displayName ?? '',
    bio: user?.profile.bio ?? '',
    city: user?.profile.city ?? '',
    state: user?.profile.state ?? '',
  });

  if (!user) return null;

  return (
    <Card className="max-w-2xl">
      <CardContent className="pt-5">
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            update.mutate(form);
          }}
        >
          <Field label="Email" htmlFor="profile-email" hint="Changing your email is not supported yet.">
            <Input id="profile-email" value={user.email} readOnly disabled />
          </Field>

          <Field label="Display name" htmlFor="profile-name" required>
            <Input
              id="profile-name"
              required
              minLength={2}
              maxLength={80}
              value={form.displayName}
              onChange={(event) => setForm({ ...form, displayName: event.target.value })}
            />
          </Field>

          <Field label="About you" htmlFor="profile-bio">
            <Textarea
              id="profile-bio"
              maxLength={600}
              value={form.bio}
              onChange={(event) => setForm({ ...form, bio: event.target.value })}
              placeholder="Where you usually travel, and what you look for."
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City" htmlFor="profile-city">
              <Input
                id="profile-city"
                maxLength={120}
                value={form.city}
                onChange={(event) => setForm({ ...form, city: event.target.value })}
              />
            </Field>
            <Field label="State" htmlFor="profile-state">
              <Input
                id="profile-state"
                maxLength={120}
                value={form.state}
                onChange={(event) => setForm({ ...form, state: event.target.value })}
              />
            </Field>
          </div>

          {user.emailVerified ? null : (
            <p className="rounded-[var(--radius-control)] bg-[#fdf7e8] p-3 text-sm text-ink-soft">
              Your email is not verified yet. Booking and reviewing need a verified address.
            </p>
          )}

          {update.isError ? (
            <p role="alert" className="text-sm text-danger-500">
              {describeError(update.error).description}
            </p>
          ) : null}
          {update.isSuccess ? (
            <p role="status" className="text-sm text-ghat-500">
              Profile saved.
            </p>
          ) : null}

          <div>
            <Button type="submit" loading={update.isPending}>
              Save profile
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}