'use client';

import { Card, CardContent, PageHeader, StatTile } from '@/ui';
import { useAnalytics } from '@/guide/hooks/use-guide';
import { QueryBoundary } from '@/guide/components/query-boundary';
import { RequireAuth } from '@/guide/components/require-auth';

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Insight"
        title="Analytics"
        description="Views, saves and conversion over the last 30 days, counted from real interaction events."
      />
      <RequireAuth>
        <Analytics />
      </RequireAuth>
    </div>
  );
}

function Analytics() {
  const query = useAnalytics();

  return (
    <QueryBoundary
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      data={query.data}
      onRetry={() => void query.refetch()}
      skeleton="rows"
    >
      {({ analytics }) => {
        const totalViews = analytics.places.reduce((sum, place) => sum + place.views, 0);
        const totalSaves = analytics.places.reduce((sum, place) => sum + place.saves, 0);

        return (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile label="Total views" value={totalViews} />
              <StatTile label="Total saves" value={totalSaves} />
              <StatTile
                label={`Bookings (${analytics.windowDays}d)`}
                value={analytics.bookingsInWindow}
                tone="positive"
              />
              <StatTile
                label="View to booking"
                value={`${(analytics.viewToBookingRate * 100).toFixed(2)}%`}
              />
            </div>

            <Card>
              <CardContent className="pt-5">
                <h2 className="pb-3 text-lg">Per place</h2>
                {analytics.places.length === 0 ? (
                  <p className="text-sm text-ink-muted">You have no places yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <caption className="sr-only">Views and saves per place</caption>
                      <thead>
                        <tr className="border-b border-line text-left text-ink-muted">
                          <th scope="col" className="py-2 pr-4 font-medium">
                            Place
                          </th>
                          <th scope="col" className="py-2 pr-4 font-medium">
                            Views
                          </th>
                          <th scope="col" className="py-2 font-medium">
                            Saves
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.places.map((place) => (
                          <tr key={place.id} className="border-b border-line last:border-0">
                            <td className="py-2 pr-4">{place.title}</td>
                            <td className="py-2 pr-4 tabular-nums">{place.views}</td>
                            <td className="py-2 tabular-nums">{place.saves}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5 text-sm text-ink-muted">
                <p className="font-medium text-ink">A note on these numbers</p>
                <p className="pt-1">
                  Views feed the popularity signal, and popularity is a penalty in Anvesh discovery.
                  A place that suddenly gets a lot of traffic will rank lower next time the nightly
                  ranking job runs. That is the product working as designed.
                </p>
              </CardContent>
            </Card>
          </div>
        );
      }}
    </QueryBoundary>
  );
}