import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type AuthSession, type PublicUser } from '@/lib/types';
import { api } from '@/guide/lib/api';
import { queryKeys } from '@/guide/lib/query-keys';
import { useSessionStore } from '@/guide/lib/session-store';

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
      api.post<AuthSession>('/auth/login', { ...input, portal: 'TOURIST_GUIDE' }),
    onSuccess: (session) => {
      setSession(session.tokens.accessToken, session.user);
      void queryClient.invalidateQueries();
    },
  });
}

/**
 * Creates a Tourist Guide account.
 *
 * `accountType` is the only thing that differs from traveller registration,
 * and it is sent by this portal rather than chosen in the form: the server
 * derives the role and the portal list from it and ignores any role the client
 * tries to send. Registering here also creates the empty guide profile that
 * the portal's own pages then fill in.
 */
export function useRegister() {
  return useMutation({
    mutationFn: (input: { email: string; password: string; displayName: string }) =>
      api.post<{ user: PublicUser }>('/auth/register', {
        ...input,
        accountType: 'TOURIST_GUIDE',
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