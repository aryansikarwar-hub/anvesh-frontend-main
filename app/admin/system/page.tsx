'use client';

import SystemHealthPage from '@/admin/pages/SystemHealthPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("System health", "Anvesh Admin");
  return <SystemHealthPage />;
}
