'use client';

import GuideBookingDetail from '@/guide/pages/GuideBookingDetail';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Booking detail", "Anvesh Guide");
  return <GuideBookingDetail />;
}
