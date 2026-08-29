'use client';

import AdminStoriesPage from '@/admin/pages/AdminStoriesPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Stories", "Anvesh Admin");
  return <AdminStoriesPage />;
}
