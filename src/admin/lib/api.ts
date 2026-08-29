import { ApiClient, ApiError } from '@/lib/shared';
import { type AuthTokens } from '@/lib/types';
import { PORTAL, publicEnv } from './env';
import { getAccessToken, useSessionStore } from './session-store';

let refreshInFlight: Promise<string | null> | null = null;

/**
 * Silent refresh. Concurrent 401s share a single refresh call, so a page with
 * six queries does not fire six rotations and trip the reuse detector.
 */
async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${publicEnv.apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        useSessionStore.getState().clear();
        return null;
      }
      const payload = (await response.json()) as { data?: { tokens?: AuthTokens } };
      const token = payload.data?.tokens?.accessToken ?? null;
      if (token) useSessionStore.getState().setToken(token);
      else useSessionStore.getState().clear();
      return token;
    } catch {
      useSessionStore.getState().clear();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export const api = new ApiClient({
  baseUrl: publicEnv.apiBaseUrl,
  portal: PORTAL,
  getAccessToken,
  onUnauthorized: refreshAccessToken,
});

export { ApiError };

/** Turns an unknown thrown value into something a UI can render safely. */
export function describeError(error: unknown): {
  title: string;
  description: string;
  code?: string;
  requestId?: string;
} {
  if (error instanceof ApiError) {
    return {
      title: titleFor(error.code),
      description: error.message,
      code: error.code,
      ...(error.requestId ? { requestId: error.requestId } : {}),
    };
  }
  return {
    title: 'Something went wrong',
    description: 'The request did not go through. Try again in a moment.',
  };
}

function titleFor(code: string): string {
  switch (code) {
    case 'NETWORK_ERROR':
      return 'Cannot reach Anvesh';
    case 'RATE_LIMITED':
      return 'Slow down a moment';
    case 'UNAUTHORIZED':
    case 'AUTH_TOKEN_EXPIRED':
      return 'Please sign in again';
    case 'VALIDATION_ERROR':
      return 'Check the form';
    case 'SLOT_SOLD_OUT':
      return 'Those seats just went';
    case 'PAYMENT_PROVIDER_NOT_CONFIGURED':
      return 'Payments are not set up';
    case 'AI_HALLUCINATED_REFERENCE':
      return 'That answer was rejected';
    default:
      return 'Something went wrong';
  }
}
