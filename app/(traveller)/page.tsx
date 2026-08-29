'use client';

import HomePage from '@/user/pages/HomePage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("", "Anvesh");
  return <HomePage />;
}
