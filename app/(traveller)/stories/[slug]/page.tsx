'use client';

import StoryPage from '@/user/pages/StoryPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Story", "Anvesh");
  return <StoryPage />;
}
