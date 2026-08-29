'use client';

import AdminPlacesPage from '@/admin/pages/AdminPlacesPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Places", "Anvesh Admin");
  return <AdminPlacesPage />;
}
