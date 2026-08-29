'use client';

import BookingsPage from '@/user/pages/BookingsPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Bookings", "Anvesh");
  return <BookingsPage />;
}
