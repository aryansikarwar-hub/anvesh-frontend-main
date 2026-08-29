/** Public runtime configuration for the traveller portal. */
export const publicEnv = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1',
  mapsProvider: process.env.NEXT_PUBLIC_MAPS_PROVIDER ?? 'maplibre-demo',
  olaMapsApiKey: process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY ?? '',
  mapTilerApiKey: process.env.NEXT_PUBLIC_MAPTILER_API_KEY ?? '',
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
} as const;

export const PORTAL = 'TRAVELLER' as const;