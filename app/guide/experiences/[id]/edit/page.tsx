'use client';

import EditExperiencePage from '@/guide/pages/EditExperiencePage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Edit experience", "Anvesh Guide");
  return <EditExperiencePage />;
}
