'use client';

import CategoryPage from '@/user/pages/CategoryPage';
import { useSetTitle } from '@/components/page-title';

export default function Page() {
  useSetTitle("Category", "Anvesh");
  return <CategoryPage />;
}
