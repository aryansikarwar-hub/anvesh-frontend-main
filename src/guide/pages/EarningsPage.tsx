'use client';

import { Link } from '@/guide/router';
import { Button, Card, CardContent, Money, PageHeader, StatTile } from '@/ui';
import { useEarnings } from '@/guide/hooks/use-guide';
import { QueryBoundary } from '@/guide/components/query-boundary';
import { RequireAuth } from '@/guide/components/require-auth';

export default function EarningsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Commerce"
        title="Earnings"
        description="Computed from confirmed and completed bookings on your own experiences."
        actions={
          <Button asChild variant="secondary">
            <Link href="/payouts">Payout details</Link>
          </Button>
        }
      />
      <RequireAuth>
        <Earnings />
      </RequireAuth>
    </div>
  );
}

function Earnings() {
  const query = useEarnings();

  return (
    <QueryBoundary
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      data={query.data}
      onRetry={() => void query.refetch()}
      skeleton="rows"
    >
      {({ earnings }) => (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Gross" value={<Money minor={earnings.lifetimeGrossMinor} />} />
            <StatTile
              label="Commission"
              value={<Money minor={earnings.lifetimeCommissionMinor} />}
              hint="platform share"
            />
            <StatTile
              label="Net earned"
              value={<Money minor={earnings.lifetimeNetMinor} />}
              tone="positive"
            />
            <StatTile
              label="Awaiting payout"
              value={<Money minor={earnings.pendingPayoutMinor} />}
              tone={earnings.pendingPayoutMinor > 0 ? 'attention' : 'neutral'}
            />
          </div>

          <Card>
            <CardContent className="pt-5">
              <h2 className="pb-3 text-lg">By month</h2>
              {earnings.monthly.length === 0 ? (
                <p className="text-sm text-ink-muted">
                  Nothing yet. Confirmed bookings appear here in the month of the experience.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <caption className="sr-only">Monthly earnings</caption>
                    <thead>
                      <tr className="border-b border-line text-left text-ink-muted">
                        <th scope="col" className="py-2 pr-4 font-medium">
                          Month
                        </th>
                        <th scope="col" className="py-2 pr-4 font-medium">
                          Bookings
                        </th>
                        <th scope="col" className="py-2 pr-4 font-medium">
                          Gross
                        </th>
                        <th scope="col" className="py-2 font-medium">
                          Net
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {earnings.monthly.map((row) => (
                        <tr key={row.month} className="border-b border-line last:border-0">
                          <td className="py-2 pr-4">{row.month}</td>
                          <td className="py-2 pr-4 tabular-nums">{row.bookings}</td>
                          <td className="py-2 pr-4 tabular-nums">
                            <Money minor={row.grossMinor} />
                          </td>
                          <td className="py-2 tabular-nums">
                            <Money minor={row.netMinor} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </QueryBoundary>
  );
}