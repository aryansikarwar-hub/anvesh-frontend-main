'use client';

import AdminUserDetail from '@/admin/pages/AdminUserDetail';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("User detail", "Anvesh Admin");
  return <AdminUserDetail />;
}
