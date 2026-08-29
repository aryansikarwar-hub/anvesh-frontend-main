'use client';

import PayoutsPage from '@/guide/pages/PayoutsPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Payouts", "Anvesh Guide");
  return <PayoutsPage />;
}
