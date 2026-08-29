'use client';

import DestinationPage from '@/user/pages/DestinationPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Destination", "Anvesh");
  return <DestinationPage />;
}
