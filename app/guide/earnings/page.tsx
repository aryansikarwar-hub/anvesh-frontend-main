'use client';

import EarningsPage from '@/guide/pages/EarningsPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Earnings", "Anvesh Guide");
  return <EarningsPage />;
}
