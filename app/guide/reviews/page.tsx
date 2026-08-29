'use client';

import GuideReviewsPage from '@/guide/pages/GuideReviewsPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Reviews", "Anvesh Guide");
  return <GuideReviewsPage />;
}
