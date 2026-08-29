'use client';

import { Suspense, useEffect, useRef } from 'react';
import { Link } from '@/user/router';
import { useSearchParams } from '@/user/router';
import { useMutation } from '@tanstack/react-query';
import { Button, LoadingState } from '@/ui';
import { api, describeError } from '@/user/lib/api';
import { AuthShell } from '@/user/components/auth-shell';

function VerifyEmail() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const attempted = useRef(false);
  const verify = useMutation({
    mutationFn: (value: string) =>
      api.post<{ verified: boolean }>('/auth/verify-email', { token: value }),
  });

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;
    verify.mutate(token);
  }, [token, verify]);

  if (!token) {
    return <p className="text-sm text-danger-500">This link is missing its token.</p>;
  }
  if (verify.isPending) return <LoadingState rows={1} label="Verifying your email" />;
  if (verify.isError) {
    return (
      <div className="flex flex-col gap-3 text-sm">
        <p className="text-danger-500">{describeError(verify.error).description}</p>
        <p className="text-ink-muted">
          Verification links expire. Sign in and request a new one from your profile.
        </p>
        <Button asChild variant="secondary">
          <Link href="/login">Go to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 text-sm">
      <p>Your email is verified. You can book experiences and write reviews now.</p>
      <Button asChild>
        <Link href="/explore">Start exploring</Link>
      </Button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthShell title="Verify your email" description="One click and your account is ready.">
      <Suspense fallback={<LoadingState rows={1} />}>
        <VerifyEmail />
      </Suspense>
    </AuthShell>
  );
}