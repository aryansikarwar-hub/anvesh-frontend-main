'use client';

import RecommendationConfigPage from '@/admin/pages/RecommendationConfigPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Recommendation config", "Anvesh Admin");
  return <RecommendationConfigPage />;
}
