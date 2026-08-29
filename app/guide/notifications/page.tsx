'use client';

import GuideNotificationsPage from '@/guide/pages/GuideNotificationsPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Notifications", "Anvesh Guide");
  return <GuideNotificationsPage />;
}
