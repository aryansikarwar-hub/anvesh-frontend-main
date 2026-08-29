'use client';

import BookingPage from '@/user/pages/BookingPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Booking", "Anvesh");
  return <BookingPage />;
}
