'use client';

import AiMonitoringPage from '@/admin/pages/AiMonitoringPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("AI monitoring", "Anvesh Admin");
  return <AiMonitoringPage />;
}
