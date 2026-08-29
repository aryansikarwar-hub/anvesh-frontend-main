'use client';

import GuideBookingsPage from '@/guide/pages/GuideBookingsPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Bookings", "Anvesh Guide");
  return <GuideBookingsPage />;
}
