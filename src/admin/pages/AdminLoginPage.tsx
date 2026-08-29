'use client';

import { useState } from 'react';
import { useRouter } from '@/admin/router';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { Button, Field, Input } from '@/ui';
import { useAdminLogin, useAdminTotp, type AdminLoginResult } from '@/admin/hooks/use-admin-session';
import { AuthShell } from '@/admin/components/auth-shell';
import { describeError } from '@/admin/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAdminLogin();
  const totp = useAdminTotp();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [code, setCode] = useState('');
  const [challenge, setChallenge] = useState<AdminLoginResult | null>(null);

  return (
    <AuthShell
      title={challenge ? 'Second factor' : 'Admin sign in'}
      description={
        challenge
          ? 'Enter the six-digit code from your authenticator app, or a recovery code.'
          : 'Invite-only. A password alone never produces a session here.'
      }
    >
      {challenge ? (
        <div className="flex flex-col gap-4">
          {challenge.status === 'TOTP_ENROLMENT_REQUIRED' ? (
            <div className="flex flex-col gap-2 rounded-[var(--radius-control)] border border-gold-300 bg-[#fdf7e8] p-3 text-sm">
              <p className="font-medium">Set up your authenticator</p>
              <p className="text-ink-soft">
                Add this key to your authenticator app, then enter the code it shows.
              </p>
              <code className="break-all rounded bg-paper p-2 font-mono text-xs">
                {challenge.otpauthUrl}
              </code>
              {challenge.recoveryCodes?.length ? (
                <>
                  <p className="pt-1 font-medium">Recovery codes</p>
                  <p className="text-ink-soft">
                    Save these now. Each works once and they are not shown again.
                  </p>
                  <ul className="grid grid-cols-2 gap-1 font-mono text-xs">
                    {challenge.recoveryCodes.map((recovery) => (
                      <li key={recovery}>{recovery}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          ) : null}

          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              totp.mutate(
                { challengeToken: challenge.challengeToken, code },
                { onSuccess: () => router.push('/') },
              );
            }}
          >
            <Field label="Authentication code" htmlFor="totp-code" required>
              <Input
                id="totp-code"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={12}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="123456"
              />
            </Field>
            {totp.isError ? (
              <p role="alert" className="text-sm text-danger-500">
                {describeError(totp.error).description}
              </p>
            ) : null}
            <Button type="submit" loading={totp.isPending}>
              <ShieldCheck aria-hidden="true" />
              Verify and sign in
            </Button>
            <Button variant="ghost" type="button" onClick={() => setChallenge(null)}>
              Start over
            </Button>
          </form>
        </div>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            login.mutate(credentials, { onSuccess: (result) => setChallenge(result) });
          }}
        >
          <Field label="Email" htmlFor="admin-email" required>
            <Input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              value={credentials.email}
              onChange={(event) => setCredentials({ ...credentials, email: event.target.value })}
            />
          </Field>
          <Field label="Password" htmlFor="admin-password" required>
            <Input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={credentials.password}
              onChange={(event) => setCredentials({ ...credentials, password: event.target.value })}
            />
          </Field>
          {login.isError ? (
            <p role="alert" className="text-sm text-danger-500">
              {describeError(login.error).description}
            </p>
          ) : null}
          <Button type="submit" loading={login.isPending}>
            <KeyRound aria-hidden="true" />
            Continue
          </Button>
        </form>
      )}
    </AuthShell>
  );
}