'use client';

import ResetPasswordPage from '@/user/pages/ResetPasswordPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Reset password", "Anvesh");
  return <ResetPasswordPage />;
}
