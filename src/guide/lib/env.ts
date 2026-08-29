/** Public runtime configuration for the Tourist Guide portal. */
export const publicEnv = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1',
} as const;

export const PORTAL = 'TOURIST_GUIDE' as const;
