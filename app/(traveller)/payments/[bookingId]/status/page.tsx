'use client';

import PaymentStatusPage from '@/user/pages/PaymentStatusPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Payment status", "Anvesh");
  return <PaymentStatusPage />;
}
