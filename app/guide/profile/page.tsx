'use client';

import GuideProfilePage from '@/guide/pages/GuideProfilePage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Profile", "Anvesh Guide");
  return <GuideProfilePage />;
}
