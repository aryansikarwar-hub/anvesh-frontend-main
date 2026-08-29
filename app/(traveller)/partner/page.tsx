'use client';

import PartnerPage from '@/user/pages/PartnerPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("For locals", "Anvesh");
  return <PartnerPage />;
}
