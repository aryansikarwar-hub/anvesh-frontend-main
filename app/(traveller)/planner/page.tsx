'use client';

import PlannerPage from '@/user/pages/PlannerPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("AI Planner", "Anvesh");
  return <PlannerPage />;
}
