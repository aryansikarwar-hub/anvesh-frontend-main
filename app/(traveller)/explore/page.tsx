'use client';

import ExplorePage from '@/user/pages/ExplorePage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Explore", "Anvesh");
  return <ExplorePage />;
}
