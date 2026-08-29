'use client';

import AdminExperiencesPage from '@/admin/pages/AdminExperiencesPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Experiences", "Anvesh Admin");
  return <AdminExperiencesPage />;
}
