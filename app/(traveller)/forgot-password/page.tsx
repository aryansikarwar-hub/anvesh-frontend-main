'use client';

import ForgotPasswordPage from '@/user/pages/ForgotPasswordPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Forgot password", "Anvesh");
  return <ForgotPasswordPage />;
}
