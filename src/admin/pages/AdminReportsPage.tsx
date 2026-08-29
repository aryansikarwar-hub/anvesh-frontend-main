'use client';

import { useState } from 'react';
import { Badge, Button, PageHeader, Pagination, Select } from '@/ui';
import { type ContentReport } from '@/lib/types';
import { useAdminReports, useResolveReport } from '@/admin/hooks/use-admin';
import { QueryBoundary } from '@/admin/components/query-boundary';
import { RequireAuth } from '@/admin/components/require-auth';
import { DataTable } from '@/admin/components/data-table';

export default function AdminReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Moderation"
        title="Reports"
        description="Complaints raised by travellers about places, experiences, reviews or guides."
      />
      <RequireAuth>
        <ReportsTable />
      </RequireAuth>
    </div>
  );
}

function ReportsTable() {
  const [status, setStatus] = useState('OPEN');
  const [page, setPage] = useState(1);
  const reports = useAdminReports({ page, ...(status ? { status } : {}) });
  const resolve = useResolveReport();

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-xs">
        <label htmlFor="report-status" className="text-sm font-medium text-ink-soft">
          Status
        </label>
        <Select
          id="report-status"
          className="mt-1"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All</option>
          <option value="OPEN">Open</option>
          <option value="IN_REVIEW">In review</option>
          <option value="RESOLVED">Resolved</option>
          <option value="DISMISSED">Dismissed</option>
        </Select>
      </div>

      <QueryBoundary
        isLoading={reports.isLoading}
        isError={reports.isError}
        error={reports.error}
        data={reports.data}
        isEmpty={(data) => data.items.length === 0}
        onRetry={() => void reports.refetch()}
        emptyTitle="Nothing reported"
        emptyDescription="No complaints match that status."
        skeleton="rows"
      >
        {(data) => (
          <div className="flex flex-col gap-4">
            <DataTable<ContentReport>
              caption="Content reports"
              rows={data.items}
              rowKey={(report) => report.id}
              columns={[
                {
                  key: 'target',
                  header: 'Target',
                  render: (report) => (
                    <div>
                      <p className="text-xs font-medium">{report.targetType.toLowerCase()}</p>
                      <p className="font-mono text-xs text-ink-faint">{report.targetId}</p>
                    </div>
                  ),
                },
                {
                  key: 'reason',
                  header: 'Reason',
                  render: (report) => (
                    <div className="max-w-md">
                      <p className="text-xs font-medium">{report.reason.toLowerCase()}</p>
                      {report.details ? (
                        <p className="pt-0.5 text-xs text-ink-muted">{report.details}</p>
                      ) : null}
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (report) => (
                    <Badge variant={report.status === 'OPEN' ? 'warn' : 'neutral'}>
                      {report.status.replace(/_/g, ' ').toLowerCase()}
                    </Badge>
                  ),
                },
                {
                  key: 'actions',
                  header: 'Decision',
                  align: 'right',
                  render: (report) =>
                    report.status === 'OPEN' || report.status === 'IN_REVIEW' ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          loading={resolve.isPending}
                          onClick={() =>
                            resolve.mutate({
                              id: report.id,
                              status: 'RESOLVED',
                              resolutionNote: 'Action taken',
                            })
                          }
                        >
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={resolve.isPending}
                          onClick={() =>
                            resolve.mutate({
                              id: report.id,
                              status: 'DISMISSED',
                              resolutionNote: 'No action needed',
                            })
                          }
                        >
                          Dismiss
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-ink-faint">{report.resolutionNote || '—'}</span>
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