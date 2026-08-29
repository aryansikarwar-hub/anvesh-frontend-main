import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The app talks to `backend/` over plain <img> tags and fetch() calls —
  // nothing here needs next/image's remote loader allowlist to build, but
  // add the backend's asset host if you switch PlaceCover / hero images to
  // next/image later.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
