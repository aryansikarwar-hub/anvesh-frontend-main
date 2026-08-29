'use client';

import AnalyticsPage from '@/guide/pages/AnalyticsPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Analytics", "Anvesh Guide");
  return <AnalyticsPage />;
}
