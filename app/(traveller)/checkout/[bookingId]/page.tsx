'use client';

import CheckoutPage from '@/user/pages/CheckoutPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Checkout", "Anvesh");
  return <CheckoutPage />;
}
