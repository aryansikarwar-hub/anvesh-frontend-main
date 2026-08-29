'use client';

import { Suspense, useState } from 'react';
import { Link } from '@/user/router';
import { useRouter, useSearchParams } from '@/user/router';
import { Button, Field, Input, LoadingState } from '@/ui';
import { useLogin } from '@/user/hooks/use-session';
import { AuthShell } from '@/user/components/auth-shell';
import { describeError } from '@/user/lib/api';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useLogin();
  const [form, setForm] = useState({ email: '', password: '' });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        login.mutate(form, {
          onSuccess: () => router.push(params.get('next') ?? '/'),
        });
      }}
    >
      <Field label="Email" htmlFor="login-email" required>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
      </Field>

      <Field label="Password" htmlFor="login-password" required>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />
      </Field>

      {login.isError ? (
        <p role="alert" className="text-sm text-danger-500">
          {describeError(login.error).description}
        </p>
      ) : null}

      <Button type="submit" loading={login.isPending}>
        Sign in
      </Button>

      <Link href="/forgot-password" className="text-center text-sm text-laterite-600 underline">
        Forgot your password?
      </Link>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in"
      description="Traveller portal. Tourist guides sign in at /guide, staff at /admin."
      footer={
        <>
          New here?{' '}
          <Link href="/register" className="text-laterite-600 underline">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense fallback={<LoadingState rows={2} />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}