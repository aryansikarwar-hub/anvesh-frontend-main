'use client';

import ProfilePage from '@/user/pages/ProfilePage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Profile", "Anvesh");
  return <ProfilePage />;
}
