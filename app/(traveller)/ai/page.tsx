'use client';

import AiPage from '@/user/pages/AiPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Ask Anvesh", "Anvesh");
  return <AiPage />;
}
