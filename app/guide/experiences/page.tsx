'use client';

import GuideExperiencesPage from '@/guide/pages/GuideExperiencesPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Experiences", "Anvesh Guide");
  return <GuideExperiencesPage />;
}
