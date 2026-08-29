import { create } from 'zustand';
import { type PublicUser } from '@/lib/types';

interface SessionState {
  /**
   * The access token lives in memory only. The refresh token is an httpOnly
   * cookie the browser cannot read, so an XSS payload cannot steal a session
   * that outlives the page.
   */
  accessToken: string | null;
  user: PublicUser | null;
  status: 'unknown' | 'authenticated' | 'anonymous';
  setSession: (token: string, user: PublicUser) => void;
  setUser: (user: PublicUser) => void;
  setToken: (token: string) => void;
  clear: () => void;
  markAnonymous: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: null,
  user: null,
  status: 'unknown',
  setSession: (accessToken, user) => set({ accessToken, user, status: 'authenticated' }),
  setUser: (user) => set({ user }),
  setToken: (accessToken) => set({ accessToken, status: 'authenticated' }),
  clear: () => set({ accessToken: null, user: null, status: 'anonymous' }),
  markAnonymous: () => set({ status: 'anonymous' }),
}));

export function getAccessToken(): string | null {
  return useSessionStore.getState().accessToken;
}
