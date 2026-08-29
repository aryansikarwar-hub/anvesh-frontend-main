'use client';

import PlacePage from '@/user/pages/PlacePage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Place", "Anvesh");
  return <PlacePage />;
}
