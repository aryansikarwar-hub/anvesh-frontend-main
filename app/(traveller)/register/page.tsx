'use client';

import RegisterPage from '@/user/pages/RegisterPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Register", "Anvesh");
  return <RegisterPage />;
}
