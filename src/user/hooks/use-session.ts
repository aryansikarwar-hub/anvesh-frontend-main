import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type AuthSession, type PublicUser } from '@/lib/types';
import { api } from '@/user/lib/api';
import { queryKeys } from '@/user/lib/query-keys';
import { useSessionStore } from '@/user/lib/session-store';

/**
 * Restores the session on first paint by exchanging the httpOnly refresh
 * cookie for an access token, then loading the user.
 */
export function useSessionBootstrap(): void {
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

export function useLogin() {
  const setSession = useSessionStore((s) => s.setSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      api.post<AuthSession>('/auth/login', { ...input, portal: 'TRAVELLER' }),
    onSuccess: (session) => {
      setSession(session.tokens.accessToken, session.user);
      void queryClient.invalidateQueries();
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: { email: string; password: string; displayName: string }) =>
      api.post<{ user: PublicUser }>('/auth/register', {
        ...input,
        accountType: 'TRAVELLER',
        acceptTerms: true,
      }),
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

export function useMe(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: () => api.get<{ user: PublicUser }>('/auth/me'),
    enabled,
    staleTime: 60_000,
  });
}
