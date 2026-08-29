'use client';

import { PageShell } from '@/ui';
import { useParams } from '@/user/router';
import { DiscoveryResults } from '@/user/components/discovery-results';

export default function CategoryPage() {
  const { slug } = useParams() as { slug: string };
  const label = slug.replace(/-/g, ' ');

  return (
    <PageShell className="py-8">
      <DiscoveryResults
        title={label.charAt(0).toUpperCase() + label.slice(1)}
        description="Everything published in this category, quietest and most local first."
        lockedCategory={slug}
      />
    </PageShell>
  );
}