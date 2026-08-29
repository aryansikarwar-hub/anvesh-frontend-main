'use client';

import { useState } from 'react';
import { Card, CardContent, Money, PageHeader, Select } from '@/ui';
import { useAdminAnalytics } from '@/admin/hooks/use-admin';
import { QueryBoundary } from '@/admin/components/query-boundary';
import { RequireAuth } from '@/admin/components/require-auth';

export default function AdminAnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Overview"
        title="Analytics"
        description="Bookings and interaction events over the last 90 days."
      />
      <RequireAuth>
        <Analytics />
      </RequireAuth>
    </div>
  );
}

function Analytics() {
  const [granularity, setGranularity] = useState('day');
  const query = useAdminAnalytics({ granularity });

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-xs">
        <label htmlFor="granularity" className="text-sm font-medium text-ink-soft">
          Granularity
        </label>
        <Select
          id="granularity"
          className="mt-1"
          value={granularity}
          onChange={(event) => setGranularity(event.target.value)}
        >
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </Select>
      </div>

      <QueryBoundary
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        data={query.data}
        onRetry={() => void query.refetch()}
        skeleton="rows"
      >
        {(data) => {
          const maxCount = Math.max(1, ...data.bookings.map((row) => row.count));
          return (
            <div className="flex flex-col gap-6">
              <Card>
                <CardContent className="pt-5">
                  <h2 className="pb-3 text-lg">Bookings</h2>
                  {data.bookings.length === 0 ? (
                    <p className="text-sm text-ink-muted">No bookings in this window.</p>
                  ) : (
                    <ul className="flex flex-col gap-1.5">
                      {data.bookings.map((row) => (
                        <li key={row.bucket} className="flex items-center gap-3 text-sm">
                          <span className="w-24 shrink-0 font-mono text-xs text-ink-muted">
                            {row.bucket}
                          </span>
                          <span
                            className="h-3 rounded-sm bg-laterite-300"
                            style={{ width: `${(row.count / maxCount) * 60}%` }}
                            aria-hidden="true"
                          />
                          <span className="tabular-nums">{row.count}</span>
                          <span className="ml-auto text-xs text-ink-muted">
                            <Money minor={row.grossMinor} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-5">
                  <h2 className="pb-3 text-lg">Interaction events</h2>
                  {data.events.length === 0 ? (
                    <p className="text-sm text-ink-muted">
                      No events recorded. The worker writes these from the analytics queue.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <caption className="sr-only">Interaction events by bucket</caption>
                        <thead>
                          <tr className="border-b border-line text-left text-ink-muted">
                            <th scope="col" className="py-2 pr-4 font-medium">
                              Bucket
                            </th>
                            <th scope="col" className="py-2 pr-4 font-medium">
                              Type
                            </th>
                            <th scope="col" className="py-2 font-medium">
                              Count
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.events.slice(0, 60).map((row) => (
                            <tr
                              key={`${row.bucket}-${row.type}`}
                              className="border-b border-line last:border-0"
                            >
                              <td className="py-2 pr-4 font-mono text-xs">{row.bucket}</td>
                              <td className="py-2 pr-4 text-xs">{row.type.toLowerCase()}</td>
                              <td className="py-2 tabular-nums">{row.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        }}
      </QueryBoundary>
    </div>
  );
}