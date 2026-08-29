'use client';

import AdminGuidesPage from '@/admin/pages/AdminGuidesPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Guides", "Anvesh Admin");
  return <AdminGuidesPage />;
}
