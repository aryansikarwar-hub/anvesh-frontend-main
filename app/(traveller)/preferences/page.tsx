'use client';

import PreferencesPage from '@/user/pages/PreferencesPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Preferences", "Anvesh");
  return <PreferencesPage />;
}
