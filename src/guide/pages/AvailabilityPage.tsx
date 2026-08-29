'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from '@/guide/router';
import { CalendarPlus, X } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Field,
  Input,
  LoadingState,
  Money,
  PageHeader,
  Pagination,
  Select,
} from '@/ui';
import { useMyExperiences, useSlotMutations, useSlots } from '@/guide/hooks/use-guide';
import { QueryBoundary } from '@/guide/components/query-boundary';
import { RequireAuth } from '@/guide/components/require-auth';
import { describeError } from '@/guide/lib/api';

export default function AvailabilityPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Calendar"
        title="Availability"
        description="Slots are what travellers book. Seats are decremented atomically, so two people cannot take the same last seat."
      />
      <RequireAuth>
        <Suspense fallback={<LoadingState rows={3} />}>
          <Availability />
        </Suspense>
      </RequireAuth>
    </div>
  );
}

function Availability() {
  const params = useSearchParams();
  const [experienceId, setExperienceId] = useState(params.get('experienceId') ?? '');
  const [page, setPage] = useState(1);
  const experiences = useMyExperiences({ page: 1 });
  const slots = useSlots({ page, ...(experienceId ? { experienceId } : {}) });
  const mutations = useSlotMutations();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-4">
        <div className="max-w-xs">
          <Field label="Filter by experience" htmlFor="slot-filter">
            <Select
              id="slot-filter"
              value={experienceId}
              onChange={(event) => {
                setExperienceId(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All experiences</option>
              {(experiences.data?.items ?? []).map((experience) => (
                <option key={experience.id} value={experience.id}>
                  {experience.title}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <QueryBoundary
          isLoading={slots.isLoading}
          isError={slots.isError}
          error={slots.error}
          data={slots.data}
          isEmpty={(data) => data.items.length === 0}
          onRetry={() => void slots.refetch()}
          emptyTitle="No slots yet"
          emptyDescription="Generate a run of dates on the right, or add a single slot."
          skeleton="rows"
        >
          {(data) => (
            <div className="flex flex-col gap-2">
              {data.items.map((slot) => {
                const booked = slot.seatsTotal - slot.seatsAvailable;
                return (
                  <Card key={slot.id}>
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-4">
                      <div>
                        <p className="font-medium">
                          {new Date(slot.startAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </p>
                        <p className="text-sm text-ink-muted">
                          {slot.seatsAvailable} of {slot.seatsTotal} seats free
                          {booked > 0 ? ` · ${booked} booked` : ''} ·{' '}
                          <Money minor={slot.priceMinor} /> · {slot.status.toLowerCase()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            mutations.update.mutate({
                              id: slot.id,
                              patch: { status: slot.status === 'OPEN' ? 'CLOSED' : 'OPEN' },
                            })
                          }
                        >
                          {slot.status === 'OPEN' ? 'Close' : 'Reopen'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Cancel slot"
                          disabled={booked > 0}
                          title={booked > 0 ? 'Cancel the bookings first' : 'Cancel this slot'}
                          onClick={() => mutations.cancel.mutate(slot.id)}
                        >
                          <X aria-hidden="true" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              <Pagination pageInfo={data.pageInfo} onPageChange={setPage} />
            </div>
          )}
        </QueryBoundary>
      </div>

      <BulkSlotForm
        experiences={(experiences.data?.items ?? []).map((experience) => ({
          id: experience.id,
          title: experience.title,
          maxSeats: experience.maxSeats,
          priceRupees: experience.basePriceMinor / 100,
          durationMin: experience.durationMin,
        }))}
        onSubmit={(payload) => mutations.bulk.mutate(payload)}
        pending={mutations.bulk.isPending}
        error={mutations.bulk.error}
        created={mutations.bulk.data?.created}
      />
    </div>
  );
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function BulkSlotForm({
  experiences,
  onSubmit,
  pending,
  error,
  created,
}: {
  experiences: { id: string; title: string; maxSeats: number; priceRupees: number; durationMin: number }[];
  onSubmit: (payload: Record<string, unknown>) => void;
  pending: boolean;
  error: unknown;
  created?: number;
}) {
  const [form, setForm] = useState({
    experienceId: '',
    fromDate: '',
    toDate: '',
    weekdays: [6, 0] as number[],
    startTime: '06:30',
    seats: '8',
    priceRupees: '2500',
    durationMin: '240',
  });

  const selected = experiences.find((experience) => experience.id === form.experienceId);

  function toggleDay(day: number) {
    setForm((current) => ({
      ...current,
      weekdays: current.weekdays.includes(day)
        ? current.weekdays.filter((value) => value !== day)
        : [...current.weekdays, day],
    }));
  }

  return (
    <Card className="h-fit">
      <CardContent className="pt-5">
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            const [hours, minutes] = form.startTime.split(':');
            onSubmit({
              experienceId: form.experienceId,
              fromDate: form.fromDate,
              toDate: form.toDate,
              weekdays: form.weekdays,
              startTimeMin: Number(hours) * 60 + Number(minutes),
              durationMin: Number(form.durationMin),
              seatsTotal: Number(form.seats),
              priceMinor: Math.round(Number(form.priceRupees) * 100),
            });
          }}
        >
          <h2 className="text-lg">Generate slots</h2>
          <p className="text-sm text-ink-muted">
            Creates one slot per matching weekday. Re-running with the same dates is safe: duplicate
            start times are skipped, not doubled.
          </p>

          <Field label="Experience" htmlFor="bulk-experience" required>
            <Select
              id="bulk-experience"
              required
              value={form.experienceId}
              onChange={(event) => {
                const experience = experiences.find((item) => item.id === event.target.value);
                setForm((current) => ({
                  ...current,
                  experienceId: event.target.value,
                  ...(experience
                    ? {
                        seats: String(experience.maxSeats),
                        priceRupees: String(experience.priceRupees),
                        durationMin: String(experience.durationMin),
                      }
                    : {}),
                }));
              }}
            >
              <option value="">Choose an experience</option>
              {experiences.map((experience) => (
                <option key={experience.id} value={experience.id}>
                  {experience.title}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="From" htmlFor="bulk-from" required>
              <Input
                id="bulk-from"
                type="date"
                required
                value={form.fromDate}
                onChange={(event) => setForm({ ...form, fromDate: event.target.value })}
              />
            </Field>
            <Field label="To" htmlFor="bulk-to" required>
              <Input
                id="bulk-to"
                type="date"
                required
                value={form.toDate}
                onChange={(event) => setForm({ ...form, toDate: event.target.value })}
              />
            </Field>
          </div>

          <fieldset>
            <legend className="pb-1.5 text-sm font-medium text-ink-soft">Days</legend>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((label, day) => {
                const active = form.weekdays.includes(day);
                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleDay(day)}
                    className={`rounded-full border px-3 py-1 text-sm ${
                      active
                        ? 'border-laterite-500 bg-laterite-50 text-laterite-600'
                        : 'border-line-strong text-ink-soft'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Start time (IST)" htmlFor="bulk-time" required>
              <Input
                id="bulk-time"
                type="time"
                required
                value={form.startTime}
                onChange={(event) => setForm({ ...form, startTime: event.target.value })}
              />
            </Field>
            <Field label="Seats" htmlFor="bulk-seats" required>
              <Input
                id="bulk-seats"
                type="number"
                required
                min={1}
                max={selected?.maxSeats ?? 60}
                value={form.seats}
                onChange={(event) => setForm({ ...form, seats: event.target.value })}
              />
            </Field>
          </div>

          <Field label="Price per person (rupees)" htmlFor="bulk-price" required>
            <Input
              id="bulk-price"
              type="number"
              required
              min={0}
              value={form.priceRupees}
              onChange={(event) => setForm({ ...form, priceRupees: event.target.value })}
            />
          </Field>

          {error ? (
            <p role="alert" className="text-sm text-danger-500">
              {describeError(error).description}
            </p>
          ) : null}
          {typeof created === 'number' ? (
            <p role="status" className="text-sm text-ghat-500">
              {created} slot{created === 1 ? '' : 's'} created.
            </p>
          ) : null}

          <Button type="submit" loading={pending} disabled={form.weekdays.length === 0}>
            <CalendarPlus aria-hidden="true" />
            Generate
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}