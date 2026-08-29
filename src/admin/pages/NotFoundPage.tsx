'use client';

import { Link } from '@/admin/router';
import { Button, EmptyState, PageShell } from '@/ui';

export default function NotFound() {
  return (
    <PageShell className="py-16">
      <EmptyState
        title="That page does not exist"
        description="The link may be out of date, or the place may have been unpublished."
        action={
          <Button asChild>
            <Link href="/">Back to the dashboard</Link>
          </Button>
        }
      />
    </PageShell>
  );
}