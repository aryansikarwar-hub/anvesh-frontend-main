'use client';

import { Suspense } from 'react';
import { useSearchParams } from '@/user/router';
import { CardGridSkeleton, PageShell } from '@/ui';
import { DiscoveryResults } from '@/user/components/discovery-results';

function SearchResults() {
  const params = useSearchParams();
  const q = params.get('q') ?? '';

  return (
    <DiscoveryResults
      title={q ? `Results for "${q}"` : 'Search'}
      description="Text relevance blended with proximity, then re-ranked so busier places fall."
      initial={{ q }}
    />
  );
}

export default function SearchPage() {
  return (
    <PageShell className="py-8">
      <Suspense fallback={<CardGridSkeleton />}>
        <SearchResults />
      </Suspense>
    </PageShell>
  );
}