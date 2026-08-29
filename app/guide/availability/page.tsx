'use client';

import AvailabilityPage from '@/guide/pages/AvailabilityPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Availability", "Anvesh Guide");
  return <AvailabilityPage />;
}
