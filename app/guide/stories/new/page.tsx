'use client';

import NewStoryPage from '@/guide/pages/NewStoryPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("New story", "Anvesh Guide");
  return <NewStoryPage />;
}
