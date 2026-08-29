'use client';

import InvitePage from '@/admin/pages/InvitePage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Invite", "Anvesh Admin");
  return <InvitePage />;
}
