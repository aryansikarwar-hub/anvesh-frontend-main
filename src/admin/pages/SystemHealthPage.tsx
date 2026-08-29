'use client';

import { Badge, Card, CardContent, PageHeader, StatTile } from '@/ui';
import { useSystemHealth } from '@/admin/hooks/use-admin';
import { QueryBoundary } from '@/admin/components/query-boundary';
import { RequireAuth } from '@/admin/components/require-auth';

export default function SystemHealthPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Platform"
        title="System health"
        description="Refreshes every 30 seconds. A missing replica set is a hard problem: bookings and payments need transactions."
      />
      <RequireAuth>
        <Health />
      </RequireAuth>
    </div>
  );
}

function Health() {
  const query = useSystemHealth();

  return (
    <QueryBoundary
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      data={query.data}
      onRetry={() => void query.refetch()}
      skeleton="rows"
    >
      {({ system }) => (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center justify-between pt-5">
                <span className="font-medium">MongoDB</span>
                <Badge variant={system.mongo === 'up' ? 'success' : 'danger'}>{system.mongo}</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between pt-5">
                <span className="font-medium">Replica set</span>
                <Badge variant={system.mongoReplicaSet === 'up' ? 'success' : 'danger'}>
                  {system.mongoReplicaSet}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between pt-5">
                <span className="font-medium">Redis</span>
                <Badge variant={system.redis === 'up' ? 'success' : 'danger'}>{system.redis}</Badge>
              </CardContent>
            </Card>
          </div>

          {system.mongoReplicaSet !== 'up' ? (
            <Card className="border-danger-500/40">
              <CardContent className="pt-5 text-sm text-danger-700">
                MongoDB is not running as a replica set. Multi-document transactions are
                unavailable, so booking and payment will fail. Start the stack with the bundled
                docker-compose.yml, which runs a single-node replica set called rs0.
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Payment orders open"
              value={system.pendingPaymentOrders}
              hint="created but not captured"
            />
            <StatTile
              label="Expired holds to sweep"
              value={system.expiredHoldsAwaitingSweep}
              tone={system.expiredHoldsAwaitingSweep > 0 ? 'attention' : 'neutral'}
              hint="the worker releases these every five minutes"
            />
            <StatTile
              label="API uptime"
              value={`${Math.floor(system.uptimeSeconds / 3600)}h ${Math.floor((system.uptimeSeconds % 3600) / 60)}m`}
            />
            <StatTile label="Node" value={system.nodeVersion} />
          </div>
        </div>
      )}
    </QueryBoundary>
  );
}