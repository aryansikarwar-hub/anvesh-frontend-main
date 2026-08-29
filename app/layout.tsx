import type { Metadata } from 'next';
import { Suspense } from 'react';
import '@/styles/index.css';

/**
 * Root layout for the whole site.
 *
 * Three portals share one Next.js app: `(traveller)` at `/`, `guide` at
 * `/guide`, `admin` at `/admin` — see the sibling `layout.tsx` in each of
 * those folders for the header/footer/shell each portal actually renders.
 * This file only owns `<html>`/`<body>` and the global stylesheet.
 *
 * The `Suspense` boundary is required because several pages call
 * `useSearchParams()` (via each portal's router wrapper), which Next only
 * allows inside a Suspense boundary.
 */
export const metadata: Metadata = {
  title: 'Anvesh — Travel beyond the tourist map',
  description:
    "Discover the places maps don't tell you about — quiet, locally owned and genuinely worthwhile places across India.",
  themeColor: '#f8f5ee',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
        />
      </head>
      <body>
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  );
}
