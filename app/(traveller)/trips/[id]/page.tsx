'use client';

import TripPage from '@/user/pages/TripPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Trip", "Anvesh");
  return <TripPage />;
}
