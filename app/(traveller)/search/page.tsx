'use client';

import SearchPage from '@/user/pages/SearchPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Search", "Anvesh");
  return <SearchPage />;
}
