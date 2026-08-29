'use client';

import NewPlacePage from '@/guide/pages/NewPlacePage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("New place", "Anvesh Guide");
  return <NewPlacePage />;
}
