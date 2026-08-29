'use client';

import LoginPage from '@/user/pages/LoginPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Login", "Anvesh");
  return <LoginPage />;
}
