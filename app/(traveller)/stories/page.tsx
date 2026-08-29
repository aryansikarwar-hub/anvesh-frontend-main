'use client';

import StoriesPage from '@/user/pages/StoriesPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Stories", "Anvesh");
  return <StoriesPage />;
}
