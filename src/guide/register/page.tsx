'use client';

import GuideRegisterPage from '@/guide/pages/GuideRegisterPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle('Register', 'Anvesh Guide');
  return <GuideRegisterPage />;
}