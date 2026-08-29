'use client';

import { useState } from 'react';
import { Badge, Button, Input, PageHeader, Pagination, Select } from '@/ui';
import { type GuideProfile } from '@/lib/types';
import { useAdminGuides, useVerifyGuide } from '@/admin/hooks/use-admin';
import { QueryBoundary } from '@/admin/components/query-boundary';
import { RequireAuth } from '@/admin/components/require-auth';
import { DataTable } from '@/admin/components/data-table';

export default function AdminGuidesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="People"
        title="Tourist guides"
        description="Verification gates publishing bookable experiences, so check the profile before approving."
      />
      <RequireAuth>
        <GuidesTable />
      </RequireAuth>
    </div>
  );
}

function GuidesTable() {
  const [filters, setFilters] = useState({ q: '', verified: '' });
  const [page, setPage] = useState(1);
  const guides = useAdminGuides({
    page,
    ...(filters.q ? { q: filters.q } : {}),
    ...(filters.verified ? { verified: filters.verified } : {}),
  });
  const verify = useVerifyGuide();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="guide-q" className="text-sm font-medium text-ink-soft">
            Search
          </label>
          <Input
            id="guide-q"
            className="mt-1"
            value={filters.q}
            onChange={(event) => {
              setFilters({ ...filters, q: event.target.value });
              setPage(1);
            }}
            placeholder="Name, slug or city"
          />
        </div>
        <div>
          <label htmlFor="guide-verified" className="text-sm font-medium text-ink-soft">
            Verification
          </label>
          <Select
            id="guide-verified"
            className="mt-1"
            value={filters.verified}
            onChange={(event) => setFilters({ ...filters, verified: event.target.value })}
          >
            <option value="">All</option>
            <option value="false">Awaiting verification</option>
            <option value="true">Verified</option>
          </Select>
        </div>
      </div>

      <QueryBoundary
        isLoading={guides.isLoading}
        isError={guides.isError}
        error={guides.error}
        data={guides.data}
        isEmpty={(data) => data.items.length === 0}
        onRetry={() => void guides.refetch()}
        emptyTitle="No guides match"
        emptyDescription="Try clearing the filters."
        skeleton="rows"
      >
        {(data) => (
          <div className="flex flex-col gap-4">
            <DataTable<GuideProfile>
              caption="Tourist guides"
              rows={data.items}
              rowKey={(guide) => guide.id}
              columns={[
                {
                  key: 'guide',
                  header: 'Guide',
                  render: (guide) => (
                    <div className="max-w-md">
                      <p className="font-medium">{guide.displayName}</p>
                      <p className="text-xs text-ink-muted">{guide.headline || 'No headline yet'}</p>
                      <p className="pt-0.5 text-xs text-ink-faint">
                        {guide.baseCity}, {guide.baseState} · {guide.yearsExperience} years ·{' '}
                        {guide.languages.join(', ')}
                      </p>
                    </div>
                  ),
                },
                {
                  key: 'rating',
                  header: 'Rating',
                  numeric: true,
                  render: (guide) =>
                    guide.ratingCount > 0
                      ? `${guide.ratingAvg.toFixed(1)} (${guide.ratingCount})`
                      : '—',
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (guide) =>
                    guide.verified ? (
                      <Badge variant="success">Verified</Badge>
                    ) : (
                      <Badge variant="warn">Awaiting</Badge>
                    ),
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  align: 'right',
                  render: (guide) => (
                    <Button
                      size="sm"
                      variant={guide.verified ? 'secondary' : 'primary'}
                      loading={verify.isPending}
                      onClick={() =>
                        verify.mutate({
                          id: guide.id,
                          verified: !guide.verified,
                          note: guide.verified ? 'Verification withdrawn' : 'Verified by admin',
                        })
                      }
                    >
                      {guide.verified ? 'Withdraw' : 'Verify'}
                    </Button>
                  ),
                },
              ]}
            />
            <Pagination pageInfo={data.pageInfo} onPageChange={setPage} />
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}