'use client';

import AdminPaymentsPage from '@/admin/pages/AdminPaymentsPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Payments", "Anvesh Admin");
  return <AdminPaymentsPage />;
}
