'use client';

import DashboardPage from '@/guide/pages/DashboardPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("", "Anvesh Guide");
  return <DashboardPage />;
}
