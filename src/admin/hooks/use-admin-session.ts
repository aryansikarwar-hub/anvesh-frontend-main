import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type AuthSession, type PublicUser } from '@/lib/types';
import { api } from '@/admin/lib/api';
import { useSessionStore } from '@/admin/lib/session-store';

export interface AdminLoginResult {
  status: 'TOTP_REQUIRED' | 'TOTP_ENROLMENT_REQUIRED';
  challengeToken: string;
  otpauthUrl?: string;
  recoveryCodes?: string[];
}

/**
 * Restores the admin session from the httpOnly refresh cookie. There is no
 * password-only path into this portal: the cookie only exists because a TOTP
 * challenge was completed earlier.
 */
export function useAdminSessionBootstrap(): void {
  const status = useSessionStore((s) => s.status);
  const setSession = useSessionStore((s) => s.setSession);
  const markAnonymous = useSessionStore((s) => s.markAnonymous);

  useEffect(() => {
    if (status !== 'unknown') return;
    let cancelled = false;

    void (async () => {
      try {
        const { tokens } = await api.post<{ tokens: { accessToken: string } }>('/auth/refresh', {});
        if (cancelled) return;
        useSessionStore.getState().setToken(tokens.accessToken);
        const { user } = await api.get<{ user: PublicUser }>('/auth/me');
        if (!cancelled) setSession(tokens.accessToken, user);
      } catch {
        if (!cancelled) markAnonymous();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, setSession, markAnonymous]);
}

export function useCurrentUser() {
  const user = useSessionStore((s) => s.user);
  const status = useSessionStore((s) => s.status);
  return { user, isAuthenticated: status === 'authenticated' && Boolean(user), status };
}

/** Step one: password. Never returns a session on its own. */
export function useAdminLogin() {
  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      api.post<AdminLoginResult>('/admin-auth/login', input),
  });
}

/** Step two: the six-digit code, or a single-use recovery code. */
export function useAdminTotp() {
  const setSession = useSessionStore((s) => s.setSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { challengeToken: string; code: string }) =>
      api.post<AuthSession>('/admin-auth/totp', input),
    onSuccess: (session) => {
      setSession(session.tokens.accessToken, session.user);
      void queryClient.invalidateQueries();
    },
  });
}

export function useLogout() {
  const clear = useSessionStore((s) => s.clear);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ loggedOut: boolean }>('/auth/logout', { allDevices: false }),
    onSettled: () => {
      clear();
      queryClient.clear();
    },
  });
}
