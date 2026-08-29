'use client';

import AdminReportsPage from '@/admin/pages/AdminReportsPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Reports", "Anvesh Admin");
  return <AdminReportsPage />;
}
