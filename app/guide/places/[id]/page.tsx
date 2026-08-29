'use client';

import GuidePlaceDetail from '@/guide/pages/GuidePlaceDetail';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Place detail", "Anvesh Guide");
  return <GuidePlaceDetail />;
}
