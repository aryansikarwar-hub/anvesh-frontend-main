'use client';

import SettingsPage from '@/guide/pages/SettingsPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Settings", "Anvesh Guide");
  return <SettingsPage />;
}
