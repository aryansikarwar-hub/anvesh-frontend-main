'use client';

import NotificationsPage from '@/user/pages/NotificationsPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Notifications", "Anvesh");
  return <NotificationsPage />;
}
