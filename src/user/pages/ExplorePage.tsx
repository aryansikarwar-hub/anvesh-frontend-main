'use client';

import { PageShell } from '@/ui';
import { DiscoveryResults } from '@/user/components/discovery-results';

export default function ExplorePage() {
  return (
    <PageShell className="py-8">
      <DiscoveryResults
        title="Explore"
        description="Filter by what a place actually is, how busy it gets and who owns it."
      />
    </PageShell>
  );
}