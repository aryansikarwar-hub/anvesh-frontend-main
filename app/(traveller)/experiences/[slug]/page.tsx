'use client';

import ExperiencePage from '@/user/pages/ExperiencePage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Experience", "Anvesh");
  return <ExperiencePage />;
}
