'use client';

import { Badge, Card, CardContent, PageHeader } from '@/ui';
import { useParams } from '@/admin/router';
import { useAdminUser } from '@/admin/hooks/use-admin';
import { QueryBoundary } from '@/admin/components/query-boundary';
import { RequireAuth } from '@/admin/components/require-auth';

export default function AdminUserDetail() {
  const { id } = useParams() as { id: string };
  return (
    <RequireAuth>
      <UserDetail id={id} />
    </RequireAuth>
  );
}

function UserDetail({ id }: { id: string }) {
  const query = useAdminUser(id);

  return (
    <QueryBoundary
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      data={query.data}
      onRetry={() => void query.refetch()}
      skeleton="rows"
    >
      {({ user }) => (
        <div className="flex max-w-3xl flex-col gap-6">
          <PageHeader eyebrow="User" title={user.profile.displayName} description={user.email} />

          <div className="flex flex-wrap gap-2">
            <Badge variant={user.status === 'ACTIVE' ? 'success' : 'danger'}>
              {user.status.toLowerCase()}
            </Badge>
            <Badge>{user.role.replace(/_/g, ' ').toLowerCase()}</Badge>
            {user.emailVerified ? (
              <Badge variant="success">Email verified</Badge>
            ) : (
              <Badge variant="warn">Email unverified</Badge>
            )}
            {user.totpEnabled ? <Badge variant="local">TOTP enrolled</Badge> : null}
          </div>

          <Card>
            <CardContent className="pt-5">
              <h2 className="pb-3 text-lg">Account</h2>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <Row label="Portals" value={user.portals.join(', ')} />
                <Row label="Joined" value={new Date(user.createdAt).toLocaleString('en-IN')} />
                <Row label="Locale" value={user.profile.locale} />
                <Row label="City" value={user.profile.city ?? '—'} />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <h2 className="pb-3 text-lg">Discovery preferences</h2>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <Row label="Interests" value={user.preferences.interests.join(', ') || '—'} />
                <Row label="Budget" value={user.preferences.budgetBand} />
                <Row
                  label="Crowd tolerance"
                  value={`${(user.preferences.crowdTolerance * 100).toFixed(0)}%`}
                />
                <Row
                  label="Prefers local"
                  value={user.preferences.prefersLocalOwned ? 'Yes' : 'No'}
                />
              </dl>
            </CardContent>
          </Card>
        </div>
      )}
    </QueryBoundary>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="pt-0.5">{value}</dd>
    </div>
  );
}