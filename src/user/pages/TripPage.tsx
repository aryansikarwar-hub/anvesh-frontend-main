'use client';

import { useState } from 'react';
import { useParams } from '@/user/router';
import { Link } from '@/user/router';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Badge, Button, Card, CardContent, Input, PageHeader, PageShell } from '@/ui';
import { useTrip, useTripMutations } from '@/user/hooks/use-personal';
import { useSearch } from '@/user/hooks/use-discovery';
import { QueryBoundary } from '@/user/components/query-boundary';
import { RequireAuth } from '@/user/components/require-auth';

export default function TripPage() {
  const { id } = useParams() as { id: string };
  return (
    <PageShell className="flex flex-col gap-6 py-8">
      <RequireAuth>
        <TripDetail tripId={id} />
      </RequireAuth>
    </PageShell>
  );
}

function TripDetail({ tripId }: { tripId: string }) {
  const trip = useTrip(tripId);
  const mutations = useTripMutations(tripId);
  const [addingTo, setAddingTo] = useState<string | null>(null);

  return (
    <QueryBoundary
      isLoading={trip.isLoading}
      isError={trip.isError}
      error={trip.error}
      data={trip.data}
      onRetry={() => void trip.refetch()}
      skeleton="rows"
    >
      {({ trip: data }) => (
        <div className="flex flex-col gap-6">
          <PageHeader
            eyebrow="Trip"
            title={data.title}
            description={`${data.destinationName ?? 'No destination'} · ${data.travellers} traveller${data.travellers === 1 ? '' : 's'}`}
            actions={
              <Button
                loading={mutations.addDay.isPending}
                onClick={() => mutations.addDay.mutate(`Day ${data.days.length + 1}`)}
                disabled={data.days.length >= 30}
              >
                <Plus aria-hidden="true" />
                Add day
              </Button>
            }
          />

          {data.notes ? (
            <p className="max-w-3xl rounded-[var(--radius-card)] border border-line bg-paper-raised p-4 text-sm text-ink-soft">
              {data.notes}
            </p>
          ) : null}

          {data.days.length === 0 ? (
            <p className="text-sm text-ink-muted">
              No days yet. Add one, then attach places to it.
            </p>
          ) : null}

          <div className="flex flex-col gap-5">
            {data.days.map((day) => (
              <Card key={day.id}>
                <CardContent className="flex flex-col gap-3 pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge>Day {day.dayNumber}</Badge>
                      <h2 className="text-lg">{day.title}</h2>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAddingTo(addingTo === day.id ? null : day.id)}
                      >
                        <Plus aria-hidden="true" />
                        Add place
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove day ${day.dayNumber}`}
                        onClick={() => mutations.removeDay.mutate(day.id)}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  </div>

                  {day.activities.length === 0 ? (
                    <p className="text-sm text-ink-muted">Nothing planned for this day yet.</p>
                  ) : (
                    <ol className="flex flex-col gap-2">
                      {day.activities.map((activity, index) => (
                        <li
                          key={activity.id}
                          className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-line bg-paper p-3"
                        >
                          <div>
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-xs text-ink-muted">
                              {activity.kind.toLowerCase()} · {activity.durationMin} minutes
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Move earlier"
                              disabled={index === 0}
                              onClick={() =>
                                mutations.reorder.mutate({
                                  dayId: day.id,
                                  activityIds: swap(
                                    day.activities.map((a) => a.id),
                                    index,
                                    index - 1,
                                  ),
                                })
                              }
                            >
                              <ArrowUp aria-hidden="true" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Move later"
                              disabled={index === day.activities.length - 1}
                              onClick={() =>
                                mutations.reorder.mutate({
                                  dayId: day.id,
                                  activityIds: swap(
                                    day.activities.map((a) => a.id),
                                    index,
                                    index + 1,
                                  ),
                                })
                              }
                            >
                              <ArrowDown aria-hidden="true" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Remove ${activity.title}`}
                              onClick={() =>
                                mutations.removeActivity.mutate({
                                  dayId: day.id,
                                  activityId: activity.id,
                                })
                              }
                            >
                              <Trash2 aria-hidden="true" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}

                  {addingTo === day.id ? (
                    <AddPlacePanel
                      onPick={(placeId, title) => {
                        mutations.addActivity.mutate(
                          { dayId: day.id, placeId, title },
                          { onSuccess: () => setAddingTo(null) },
                        );
                      }}
                    />
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </QueryBoundary>
  );
}

function AddPlacePanel({ onPick }: { onPick: (placeId: string, title: string) => void }) {
  const [term, setTerm] = useState('');
  const results = useSearch({ q: term, limit: 6 }, term.trim().length > 1);

  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius-control)] border border-dashed border-line-strong p-3">
      <label htmlFor="trip-place-search" className="text-sm font-medium text-ink-soft">
        Search a published place
      </label>
      <Input
        id="trip-place-search"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Bandaje, Majuli, Bundi..."
      />
      {results.isLoading ? <p className="text-sm text-ink-muted">Searching...</p> : null}
      {results.data?.items.length === 0 && term.trim().length > 1 ? (
        <p className="text-sm text-ink-muted">
          Nothing matches. Only published places can be added, so a trip can never hold something
          that does not exist.
        </p>
      ) : null}
      <ul className="flex flex-col gap-1">
        {(results.data?.items ?? []).map((place) => (
          <li key={place.id}>
            <button
              type="button"
              className="w-full rounded-[var(--radius-control)] px-2 py-1.5 text-left text-sm hover:bg-paper-sunk"
              onClick={() => onPick(place.id, place.title)}
            >
              {place.title}
              <span className="text-ink-faint"> · {place.city}</span>
            </button>
          </li>
        ))}
      </ul>
      <Link href="/explore" className="text-xs text-laterite-600 underline">
        Or browse everything in explore
      </Link>
    </div>
  );
}

function swap(ids: string[], from: number, to: number): string[] {
  const next = [...ids];
  const a = next[from];
  const b = next[to];
  if (a === undefined || b === undefined) return next;
  next[from] = b;
  next[to] = a;
  return next;
}