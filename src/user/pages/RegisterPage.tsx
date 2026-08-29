'use client';

import { useState } from 'react';
import { Link } from '@/user/router';
import { Button, Field, Input } from '@/ui';
import { useRegister } from '@/user/hooks/use-session';
import { AuthShell } from '@/user/components/auth-shell';
import { describeError } from '@/user/lib/api';

export default function RegisterPage() {
  const register = useRegister();
  const [form, setForm] = useState({ displayName: '', email: '', password: '' });

  return (
    <AuthShell
      title="Join Anvesh"
      description="Save places, plan trips and book experiences with local guides."
      footer={
        <>
          Already have an account?{' '}
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
            We sent a verification link to {register.variables?.email}. Verify it to book
            experiences and write reviews.
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
          <Field label="Your name" htmlFor="register-name" required>
            <Input
              id="register-name"
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              value={form.displayName}
              onChange={(event) => setForm({ ...form, displayName: event.target.value })}
            />
          </Field>

          <Field label="Email" htmlFor="register-email" required>
            <Input
              id="register-email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </Field>

          <Field
            label="Password"
            htmlFor="register-password"
            required
            hint="At least 10 characters, with an uppercase letter, a lowercase letter and a digit."
          >
            <Input
              id="register-password"
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
            Create account
          </Button>

          <p className="text-xs text-ink-faint">
            By creating an account you agree that reviews you post are published under your display
            name.
          </p>
        </form>
      )}
    </AuthShell>
  );
}