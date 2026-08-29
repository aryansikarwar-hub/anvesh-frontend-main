'use client';

import AuditLogPage from '@/admin/pages/AuditLogPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Audit log", "Anvesh Admin");
  return <AuditLogPage />;
}
