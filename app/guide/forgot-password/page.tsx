'use client';

import ForgotPasswordPage from '@/guide/pages/ForgotPasswordPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Forgot password", "Anvesh Guide");
  return <ForgotPasswordPage />;
}
