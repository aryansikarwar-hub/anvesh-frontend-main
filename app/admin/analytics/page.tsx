'use client';

import AdminAnalyticsPage from '@/admin/pages/AdminAnalyticsPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Analytics", "Anvesh Admin");
  return <AdminAnalyticsPage />;
}
