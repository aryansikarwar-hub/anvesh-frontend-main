'use client';

import { useState } from 'react';
import { Link } from '@/guide/router';
import { Button, Field, Input } from '@/ui';
import { useRegister } from '@/guide/hooks/use-session';
import { AuthShell } from '@/guide/components/auth-shell';
import { describeError } from '@/guide/lib/api';

/**
 * Tourist Guide sign-up.
 *
 * The account created here is a TOURIST_GUIDE from the start — the server
 * reads that from `accountType` and creates the guide profile alongside the
 * user, so there is no separate "upgrade a traveller account" step.
 *
 * What it deliberately does NOT do is verify that the person is a real guide.
 * The account starts unverified: the profile carries `verified: false` until
 * an admin reviews it, and nothing a guide publishes carries a verified badge
 * before then.
 */
export default function GuideRegisterPage() {
  const register = useRegister();
  const [form, setForm] = useState({ displayName: '', email: '', password: '' });

  return (
    <AuthShell
      title="Register as a Tourist Guide"
      description="List places, run experiences and take bookings from travellers."
      footer={
        <>
          Already registered?{' '}
          <Link href="/login" className="text-laterite-600 underline">
            Sign in
          </Link>
        </>
      }
    >
      {register.isSuccess ? (
        <div className="flex flex-col gap-3 text-sm">
          <p className="font-medium">Check your email.</p>
          <p className="text-ink-muted">
            We sent a verification link to {register.variables?.email}. Verify it, then sign in
            here and fill in your guide profile — your headline, languages, base city and what you
            actually run.
          </p>
          <p className="text-ink-faint">
            New guide profiles are unverified until a moderator reviews them. You can add places and
            experiences straight away; they go live after review.
          </p>
          <Button asChild variant="secondary">
            <Link href="/login">Continue to sign in</Link>
          </Button>
        </div>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            register.mutate(form);
          }}
        >
          <Field
            label="Your name"
            htmlFor="guide-register-name"
            required
            hint="Travellers will see this on your profile and on everything you publish."
          >
            <Input
              id="guide-register-name"
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              value={form.displayName}
              onChange={(event) => setForm({ ...form, displayName: event.target.value })}
            />
          </Field>

          <Field label="Email" htmlFor="guide-register-email" required>
            <Input
              id="guide-register-email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </Field>

          <Field
            label="Password"
            htmlFor="guide-register-password"
            required
            hint="At least 10 characters, with an uppercase letter, a lowercase letter and a digit."
          >
            <Input
              id="guide-register-password"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </Field>

          {register.isError ? (
            <p role="alert" className="text-sm text-danger-500">
              {describeError(register.error).description}
            </p>
          ) : null}

          <Button type="submit" loading={register.isPending}>
            Create guide account
          </Button>

          <p className="text-xs text-ink-faint">
            By registering you agree that the places, experiences and stories you publish are
            reviewed before they go live, and are shown under your display name.
          </p>
        </form>
      )}
    </AuthShell>
  );
}