'use client';

import AdminDashboardPage from '@/admin/pages/AdminDashboardPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("", "Anvesh Admin");
  return <AdminDashboardPage />;
}
