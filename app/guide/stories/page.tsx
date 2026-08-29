'use client';

import GuideStoriesPage from '@/guide/pages/GuideStoriesPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Stories", "Anvesh Guide");
  return <GuideStoriesPage />;
}
