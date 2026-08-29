'use client';

import GuideExperienceDetail from '@/guide/pages/GuideExperienceDetail';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Experience detail", "Anvesh Guide");
  return <GuideExperienceDetail />;
}
