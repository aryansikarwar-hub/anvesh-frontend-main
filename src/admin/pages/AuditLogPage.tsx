'use client';

import { useState } from 'react';
import { Input, PageHeader, Pagination } from '@/ui';
import { type AuditLogEntry } from '@/lib/types';
import { useAuditLogs } from '@/admin/hooks/use-admin';
import { QueryBoundary } from '@/admin/components/query-boundary';
import { RequireAuth } from '@/admin/components/require-auth';
import { DataTable } from '@/admin/components/data-table';

export default function AuditLogPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Platform"
        title="Audit log"
        description="Append-only. Every admin write lands here with a before and after snapshot and the request id."
      />
      <RequireAuth>
        <AuditTable />
      </RequireAuth>
    </div>
  );
}

function AuditTable() {
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const logs = useAuditLogs({ page, ...(action ? { action } : {}) });

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-xs">
        <label htmlFor="audit-action" className="text-sm font-medium text-ink-soft">
          Filter by action
        </label>
        <Input
          id="audit-action"
          className="mt-1"
          value={action}
          onChange={(event) => {
            setAction(event.target.value);
            setPage(1);
          }}
          placeholder="place.published"
        />
      </div>

      <QueryBoundary
        isLoading={logs.isLoading}
        isError={logs.isError}
        error={logs.error}
        data={logs.data}
        isEmpty={(data) => data.items.length === 0}
        onRetry={() => void logs.refetch()}
        emptyTitle="No audit entries"
        emptyDescription="Nothing has been changed from the admin portal yet."
        skeleton="rows"
      >
        {(data) => (
          <div className="flex flex-col gap-4">
            <DataTable<AuditLogEntry>
              caption="Admin audit log"
              rows={data.items}
              rowKey={(entry) => entry.id}
              columns={[
                {
                  key: 'when',
                  header: 'When',
                  render: (entry) => (
                    <span className="text-xs">
                      {new Date(entry.createdAt).toLocaleString('en-IN')}
                    </span>
                  ),
                },
                {
                  key: 'actor',
                  header: 'Actor',
                  render: (entry) => <span className="text-xs">{entry.actorEmail}</span>,
                },
                {
                  key: 'action',
                  header: 'Action',
                  render: (entry) => (
                    <div>
                      <p className="font-mono text-xs">{entry.action}</p>
                      <p className="pt-0.5 font-mono text-xs text-ink-faint">
                        {entry.targetType} {entry.targetId}
                      </p>
                    </div>
                  ),
                },
                {
                  key: 'change',
                  header: 'Change',
                  render: (entry) => (
                    <div className="max-w-md font-mono text-[11px] text-ink-muted">
                      {entry.before ? <p>before: {JSON.stringify(entry.before)}</p> : null}
                      {entry.after ? <p>after: {JSON.stringify(entry.after)}</p> : null}
                    </div>
                  ),
                },
                {
                  key: 'request',
                  header: 'Request',
                  render: (entry) => (
                    <span className="font-mono text-[11px] text-ink-faint">{entry.requestId}</span>
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