'use client';

import AdminBookingsPage from '@/admin/pages/AdminBookingsPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Bookings", "Anvesh Admin");
  return <AdminBookingsPage />;
}
