'use client';

import EditStoryPage from '@/guide/pages/EditStoryPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Edit story", "Anvesh Guide");
  return <EditStoryPage />;
}
