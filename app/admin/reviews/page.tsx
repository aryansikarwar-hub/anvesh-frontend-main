'use client';

import AdminReviewsPage from '@/admin/pages/AdminReviewsPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Reviews", "Anvesh Admin");
  return <AdminReviewsPage />;
}
