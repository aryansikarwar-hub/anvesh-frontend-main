'use client';

import GuidePlacesPage from '@/guide/pages/GuidePlacesPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Places", "Anvesh Guide");
  return <GuidePlacesPage />;
}
