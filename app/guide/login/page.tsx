'use client';

import GuideLoginPage from '@/guide/pages/GuideLoginPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Login", "Anvesh Guide");
  return <GuideLoginPage />;
}
