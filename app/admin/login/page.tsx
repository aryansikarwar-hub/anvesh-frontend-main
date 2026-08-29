'use client';

import AdminLoginPage from '@/admin/pages/AdminLoginPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Login", "Anvesh Admin");
  return <AdminLoginPage />;
}
