'use client';

import ResetPasswordPage from '@/guide/pages/ResetPasswordPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Reset password", "Anvesh Guide");
  return <ResetPasswordPage />;
}
