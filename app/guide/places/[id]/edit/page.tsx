'use client';

import EditPlacePage from '@/guide/pages/EditPlacePage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Edit place", "Anvesh Guide");
  return <EditPlacePage />;
}
