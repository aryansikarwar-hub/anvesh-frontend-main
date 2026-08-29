'use client';

import CollectionsPage from '@/user/pages/CollectionsPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Collections", "Anvesh");
  return <CollectionsPage />;
}
