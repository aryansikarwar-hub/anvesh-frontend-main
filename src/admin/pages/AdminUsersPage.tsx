'use client';

import { useState } from 'react';
import { Link } from '@/admin/router';
import { Badge, Button, Input, PageHeader, Pagination, Select } from '@/ui';
import { ROLES, USER_STATUSES, type PublicUser } from '@/lib/types';
import { useAdminUsers, useUpdateUser } from '@/admin/hooks/use-admin';
import { QueryBoundary } from '@/admin/components/query-boundary';
import { RequireAuth } from '@/admin/components/require-auth';
import { DataTable } from '@/admin/components/data-table';

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="People"
        title="Users"
        description="Suspending an account bumps its token version, so existing sessions cannot be refreshed."
      />
      <RequireAuth>
        <UsersTable />
      </RequireAuth>
    </div>
  );
}

function UsersTable() {
  const [filters, setFilters] = useState({ q: '', role: '', status: '' });
  const [page, setPage] = useState(1);
  const users = useAdminUsers({
    page,
    ...(filters.q ? { q: filters.q } : {}),
    ...(filters.role ? { role: filters.role } : {}),
    ...(filters.status ? { status: filters.status } : {}),
  });
  const update = useUpdateUser();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="user-q" className="text-sm font-medium text-ink-soft">
            Search
          </label>
          <Input
            id="user-q"
            className="mt-1"
            value={filters.q}
            onChange={(event) => {
              setFilters({ ...filters, q: event.target.value });
              setPage(1);
            }}
            placeholder="Name or email"
          />
        </div>
        <div>
          <label htmlFor="user-role" className="text-sm font-medium text-ink-soft">
            Role
          </label>
          <Select
            id="user-role"
            className="mt-1"
            value={filters.role}
            onChange={(event) => setFilters({ ...filters, role: event.target.value })}
          >
            <option value="">Any role</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role.replace(/_/g, ' ').toLowerCase()}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="user-status" className="text-sm font-medium text-ink-soft">
            Status
          </label>
          <Select
            id="user-status"
            className="mt-1"
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value })}
          >
            <option value="">Any status</option>
            {USER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.toLowerCase()}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <QueryBoundary
        isLoading={users.isLoading}
        isError={users.isError}
        error={users.error}
        data={users.data}
        isEmpty={(data) => data.items.length === 0}
        onRetry={() => void users.refetch()}
        emptyTitle="No users match"
        emptyDescription="Try a different search or clear the filters."
        skeleton="rows"
      >
        {(data) => (
          <div className="flex flex-col gap-4">
            <DataTable<PublicUser>
              caption="Platform users"
              rows={data.items}
              rowKey={(user) => user.id}
              columns={[
                {
                  key: 'user',
                  header: 'User',
                  render: (user) => (
                    <div>
                      <Link href={`/users/${user.id}`} className="font-medium hover:underline">
                        {user.profile.displayName}
                      </Link>
                      <p className="text-xs text-ink-muted">{user.email}</p>
                    </div>
                  ),
                },
                {
                  key: 'role',
                  header: 'Role',
                  render: (user) => (
                    <span className="text-xs">{user.role.replace(/_/g, ' ').toLowerCase()}</span>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (user) => (
                    <div className="flex flex-col gap-1">
                      <Badge variant={user.status === 'ACTIVE' ? 'success' : 'danger'}>
                        {user.status.toLowerCase()}
                      </Badge>
                      {!user.emailVerified ? <Badge variant="warn">Email unverified</Badge> : null}
                    </div>
                  ),
                },
                {
                  key: 'joined',
                  header: 'Joined',
                  render: (user) => (
                    <span className="text-xs">
                      {new Date(user.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  ),
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  align: 'right',
                  render: (user) => (
                    <Button
                      size="sm"
                      variant={user.status === 'SUSPENDED' ? 'secondary' : 'danger'}
                      loading={update.isPending}
                      onClick={() =>
                        update.mutate({
                          id: user.id,
                          patch: {
                            status: user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED',
                            note: 'Changed from the admin portal',
                          },
                        })
                      }
                    >
                      {user.status === 'SUSPENDED' ? 'Reinstate' : 'Suspend'}
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