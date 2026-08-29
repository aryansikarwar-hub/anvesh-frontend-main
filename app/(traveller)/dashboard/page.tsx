'use client';

import DashboardPage from '@/user/pages/DashboardPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Dashboard", "Anvesh");
  return <DashboardPage />;
}
