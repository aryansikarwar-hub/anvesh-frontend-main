'use client';

import { Badge, Card, CardContent, PageHeader, StatTile } from '@/ui';
import { useAiMonitoring } from '@/admin/hooks/use-admin';
import { QueryBoundary } from '@/admin/components/query-boundary';
import { RequireAuth } from '@/admin/components/require-auth';

const VERDICT_LABEL: Record<string, string> = {
  OK: 'Accepted',
  SCHEMA_REJECTED: 'Rejected: bad shape',
  REFERENCE_REJECTED: 'Rejected: invented a place',
  PROVIDER_ERROR: 'Provider error',
};

export default function AiMonitoringPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Platform"
        title="AI monitoring"
        description="Every model response is schema-checked and reference-checked before a user sees it. Rejections are recorded here."
      />
      <RequireAuth>
        <Monitoring />
      </RequireAuth>
    </div>
  );
}

function Monitoring() {
  const query = useAiMonitoring();

  return (
    <QueryBoundary
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      data={query.data}
      onRetry={() => void query.refetch()}
      skeleton="rows"
    >
      {(data) => (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.byVerdict.map((row) => (
              <StatTile
                key={row.verdict}
                label={VERDICT_LABEL[row.verdict] ?? row.verdict}
                value={row.count}
                hint={`${row.avgLatencyMs} ms average`}
                tone={row.verdict === 'OK' ? 'positive' : 'attention'}
              />
            ))}
            {data.byVerdict.length === 0 ? (
              <StatTile label="Requests (30d)" value={0} hint="No AI usage yet" />
            ) : null}
          </div>

          <Card>
            <CardContent className="flex flex-col gap-3 pt-5">
              <h2 className="text-lg">Recent rejections</h2>
              <p className="text-sm text-ink-muted">
                A REFERENCE_REJECTED entry means the model named a place id the database does not
                have. The whole answer was discarded rather than shown.
              </p>
              {data.recentRejections.length === 0 ? (
                <p className="text-sm text-ink-muted">Nothing rejected in the recent window.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {data.recentRejections.map((entry) => (
                    <li
                      key={entry.id}
                      className="rounded-[var(--radius-control)] border border-line p-3"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="danger">{VERDICT_LABEL[entry.verdict] ?? entry.verdict}</Badge>
                        <span className="text-xs text-ink-muted">
                          {entry.task.toLowerCase()} · {entry.provider}/{entry.model}
                        </span>
                        <span className="ml-auto font-mono text-xs text-ink-faint">
                          {entry.requestId}
                        </span>
                      </div>
                      {entry.detail ? (
                        <p className="pt-1.5 text-xs text-ink-soft">{entry.detail}</p>
                      ) : null}
                      <p className="pt-1 text-xs text-ink-faint">
                        {new Date(entry.createdAt).toLocaleString('en-IN')}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </QueryBoundary>
  );
}