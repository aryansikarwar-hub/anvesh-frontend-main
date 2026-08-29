'use client';

import { useState } from 'react';
import { Link } from '@/user/router';
import { Sparkles } from 'lucide-react';
import { Badge, Button, Card, CardContent, Field, Select } from '@/ui';
import { useAiItinerary } from '@/user/hooks/use-ai';
import { useDestinations } from '@/user/hooks/use-discovery';
import { AiError } from '@/user/components/ai-error';

/** Day-by-day itinerary builder, optionally saved as a real trip. */
export function AiItineraryPanel() {
  const destinations = useDestinations();
  const itinerary = useAiItinerary();
  const [form, setForm] = useState({
    destinationId: '',
    days: 3,
    travellers: 2,
    pace: 'BALANCED' as const,
    avoidCrowds: true,
    saveAsTrip: true,
  });

  return (
    <div className="flex flex-col gap-5">
      <form
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          itinerary.mutate({
            destinationId: form.destinationId || null,
            days: form.days,
            travellers: form.travellers,
            interests: [],
            pace: form.pace,
            avoidCrowds: form.avoidCrowds,
            saveAsTrip: form.saveAsTrip,
          });
        }}
      >
        <Field label="Destination" htmlFor="itin-destination" required>
          <Select
            id="itin-destination"
            required
            value={form.destinationId}
            onChange={(event) => setForm({ ...form, destinationId: event.target.value })}
          >
            <option value="">Choose a destination</option>
            {(destinations.data?.destinations ?? []).map((destination) => (
              <option key={destination.id} value={destination.id}>
                {destination.name}, {destination.state}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Days" htmlFor="itin-days">
          <Select
            id="itin-days"
            value={form.days}
            onChange={(event) => setForm({ ...form, days: Number(event.target.value) })}
          >
            {[1, 2, 3, 4, 5, 6, 7, 10, 14].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Pace" htmlFor="itin-pace">
          <Select
            id="itin-pace"
            value={form.pace}
            onChange={(event) =>
              setForm({ ...form, pace: event.target.value as typeof form.pace })
            }
          >
            <option value="RELAXED">Relaxed</option>
            <option value="BALANCED">Balanced</option>
            <option value="PACKED">Packed</option>
          </Select>
        </Field>

        <div className="flex items-end">
          <Button type="submit" loading={itinerary.isPending} disabled={!form.destinationId}>
            <Sparkles aria-hidden="true" />
            Build itinerary
          </Button>
        </div>
      </form>

      {itinerary.isError ? (
        <AiError error={itinerary.error} />
      ) : itinerary.data ? (
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="pt-5">
              <h2 className="text-xl">{itinerary.data.itinerary.title}</h2>
              <p className="pt-2 text-ink-soft">{itinerary.data.itinerary.summary}</p>
              {itinerary.data.trip ? (
                <p className="pt-3 text-sm">
                  Saved as a trip.{' '}
                  <Link
                    href={`/trips/${itinerary.data.trip.id}`}
                    className="text-laterite-600 underline"
                  >
                    Open the trip planner
                  </Link>
                </p>
              ) : null}
            </CardContent>
          </Card>

          {itinerary.data.itinerary.days.map((day) => (
            <Card key={day.dayNumber}>
              <CardContent className="flex flex-col gap-3 pt-5">
                <div className="flex items-center gap-2">
                  <Badge>Day {day.dayNumber}</Badge>
                  <h3 className="text-base font-semibold">{day.title}</h3>
                </div>
                <ol className="flex flex-col gap-2">
                  {day.activities.map((activity, index) => (
                    <li key={`${day.dayNumber}-${index}`} className="border-l-2 border-line pl-3">
                      <p className="font-medium">{activity.title}</p>
                      {activity.note ? (
                        <p className="text-sm text-ink-muted">{activity.note}</p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}