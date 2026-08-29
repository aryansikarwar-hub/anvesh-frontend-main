'use client';

import NewExperiencePage from '@/guide/pages/NewExperiencePage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("New experience", "Anvesh Guide");
  return <NewExperiencePage />;
}
