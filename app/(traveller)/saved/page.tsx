'use client';

import SavedPage from '@/user/pages/SavedPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Saved", "Anvesh");
  return <SavedPage />;
}
