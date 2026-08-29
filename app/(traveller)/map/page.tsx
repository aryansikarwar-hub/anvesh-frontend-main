'use client';

import MapPage from '@/user/pages/MapPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Map", "Anvesh");
  return <MapPage />;
}
