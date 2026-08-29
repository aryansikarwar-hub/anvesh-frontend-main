'use client';

import MyReviewsPage from '@/user/pages/MyReviewsPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("My reviews", "Anvesh");
  return <MyReviewsPage />;
}
