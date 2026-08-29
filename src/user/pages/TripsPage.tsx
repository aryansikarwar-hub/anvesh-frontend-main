'use client';

import { useState } from 'react';
import { Link } from '@/user/router';
import { Plus, Trash2 } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Field,
  Input,
  PageHeader,
  PageShell,
  Select,
} from '@/ui';
import { useCreateTrip, useDeleteTrip, useTrips } from '@/user/hooks/use-personal';
import { useDestinations } from '@/user/hooks/use-discovery';
import { QueryBoundary } from '@/user/components/query-boundary';
import { RequireAuth } from '@/user/components/require-auth';

export default function TripsPage() {
  return (
    <PageShell className="flex flex-col gap-6 py-8">
      <PageHeader
        eyebrow="Plan"
        title="Trips"
        description="Build a day-by-day route from places that actually exist in Anvesh."
      />
      <RequireAuth>
        <TripsList />
      </RequireAuth>
    </PageShell>
  );
}

function TripsList() {
  const trips = useTrips();
  const destinations = useDestinations();
  const createTrip = useCreateTrip();
  const deleteTrip = useDeleteTrip();
  const [form, setForm] = useState({ title: '', destinationId: '', travellers: 2 });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <QueryBoundary
          isLoading={trips.isLoading}
          isError={trips.isError}
          error={trips.error}
          data={trips.data}
          isEmpty={(data) => data.items.length === 0}
          onRetry={() => void trips.refetch()}
          emptyTitle="No trips yet"
          emptyDescription="Create one on the right, then add places to each day."
          skeleton="rows"
        >
          {(data) => (
            <div className="flex flex-col gap-3">
              {data.items.map((trip) => (
                <Card key={trip.id}>
                  <CardContent className="flex items-center justify-between gap-4 pt-5">
                    <div>
                      <h2 className="text-lg">
                        <Link href={`/trips/${trip.id}`} className="hover:underline">
                          {trip.title}
                        </Link>
                      </h2>
                      <p className="pt-1 text-sm text-ink-muted">
                        {trip.destinationName ?? 'No destination set'} · {trip.days.length} day
                        {trip.days.length === 1 ? '' : 's'} · {trip.travellers} traveller
                        {trip.travellers === 1 ? '' : 's'}
                        {trip.generatedByAi ? ' · started by the assistant' : ''}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${trip.title}`}
                      loading={deleteTrip.isPending}
                      onClick={() => deleteTrip.mutate(trip.id)}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </QueryBoundary>
      </div>

      <Card className="h-fit">
        <CardContent className="pt-5">
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              createTrip.mutate(
                {
                  title: form.title,
                  destinationId: form.destinationId || null,
                  travellers: form.travellers,
                },
                { onSuccess: () => setForm({ title: '', destinationId: '', travellers: 2 }) },
              );
            }}
          >
            <h2 className="text-lg">New trip</h2>
            <Field label="Title" htmlFor="trip-title" required>
              <Input
                id="trip-title"
                required
                minLength={2}
                maxLength={120}
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Four quiet days in Kodagu"
              />
            </Field>
            <Field label="Destination" htmlFor="trip-destination">
              <Select
                id="trip-destination"
                value={form.destinationId}
                onChange={(event) => setForm({ ...form, destinationId: event.target.value })}
              >
                <option value="">Decide later</option>
                {(destinations.data?.destinations ?? []).map((destination) => (
                  <option key={destination.id} value={destination.id}>
                    {destination.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Travellers" htmlFor="trip-travellers">
              <Select
                id="trip-travellers"
                value={form.travellers}
                onChange={(event) => setForm({ ...form, travellers: Number(event.target.value) })}
              >
                {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </Field>
            <Button type="submit" loading={createTrip.isPending}>
              <Plus aria-hidden="true" />
              Create trip
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}