'use client';

import VerifyEmailPage from '@/user/pages/VerifyEmailPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Verify email", "Anvesh");
  return <VerifyEmailPage />;
}
