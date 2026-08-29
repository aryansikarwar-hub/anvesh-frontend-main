'use client';

import GuidePage from '@/user/pages/GuidePage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Guide", "Anvesh");
  return <GuidePage />;
}
