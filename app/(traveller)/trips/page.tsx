'use client';

import TripsPage from '@/user/pages/TripsPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Trips", "Anvesh");
  return <TripsPage />;
}
