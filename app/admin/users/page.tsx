'use client';

import AdminUsersPage from '@/admin/pages/AdminUsersPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Users", "Anvesh Admin");
  return <AdminUsersPage />;
}
