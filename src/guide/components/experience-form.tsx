'use client';

import { useState } from 'react';
import { Button, Card, CardContent, Field, Input, Select, Textarea } from '@/ui';
import { type Experience } from '@/lib/types';
import { useCategories } from '@/guide/hooks/use-guide';
import { describeError } from '@/guide/lib/api';

export interface ExperienceFormValues {
  title: string;
  summary: string;
  description: string;
  category: string;
  durationMin: string;
  maxSeats: string;
  priceRupees: string;
  meetingLabel: string;
  lng: string;
  lat: string;
  city: string;
  state: string;
  languages: string;
  inclusions: string;
  exclusions: string;
  cancellationPolicy: string;
}

export function toExperienceValues(experience?: Experience): ExperienceFormValues {
  return {
    title: experience?.title ?? '',
    summary: experience?.summary ?? '',
    description: experience?.description ?? '',
    category: experience?.categorySlugs[0] ?? '',
    durationMin: experience ? String(experience.durationMin) : '240',
    maxSeats: experience ? String(experience.maxSeats) : '8',
    priceRupees: experience ? String(experience.basePriceMinor / 100) : '2500',
    meetingLabel: experience?.meetingPoint.label ?? '',
    lng: experience ? String(experience.meetingPoint.location.coordinates[0]) : '',
    lat: experience ? String(experience.meetingPoint.location.coordinates[1]) : '',
    city: experience?.meetingPoint.address.city ?? '',
    state: experience?.meetingPoint.address.state ?? '',
    languages: (experience?.languages ?? ['en']).join(', '),
    inclusions: (experience?.inclusions ?? []).join('\n'),
    exclusions: (experience?.exclusions ?? []).join('\n'),
    cancellationPolicy: experience?.cancellationPolicy ?? 'MODERATE',
  };
}

export function toExperiencePayload(values: ExperienceFormValues): Record<string, unknown> {
  const lines = (value: string) =>
    value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 15);

  return {
    title: values.title,
    summary: values.summary,
    description: values.description,
    categorySlugs: [values.category],
    durationMin: Number(values.durationMin),
    maxSeats: Number(values.maxSeats),
    // Prices go over the wire as integer paise.
    basePriceMinor: Math.round(Number(values.priceRupees) * 100),
    meetingPoint: {
      label: values.meetingLabel,
      location: { type: 'Point', coordinates: [Number(values.lng), Number(values.lat)] },
      address: { city: values.city, state: values.state, country: 'IN' },
    },
    languages: values.languages
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .slice(0, 8),
    inclusions: lines(values.inclusions),
    exclusions: lines(values.exclusions),
    cancellationPolicy: values.cancellationPolicy,
    placeId: null,
  };
}

export function ExperienceForm({
  initial,
  submitLabel,
  onSubmit,
  pending,
  error,
}: {
  initial: ExperienceFormValues;
  submitLabel: string;
  onSubmit: (payload: Record<string, unknown>) => void;
  pending: boolean;
  error: unknown;
}) {
  const [values, setValues] = useState(initial);
  const categories = useCategories();

  function set(patch: Partial<ExperienceFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  return (
    <Card className="max-w-3xl">
      <CardContent className="pt-5">
        <form
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(toExperiencePayload(values));
          }}
        >
          <Field label="Title" htmlFor="exp-title" required>
            <Input
              id="exp-title"
              required
              minLength={3}
              maxLength={140}
              value={values.title}
              onChange={(event) => set({ title: event.target.value })}
            />
          </Field>

          <Field label="Summary" htmlFor="exp-summary" required>
            <Input
              id="exp-summary"
              required
              minLength={10}
              maxLength={300}
              value={values.summary}
              onChange={(event) => set({ summary: event.target.value })}
            />
          </Field>

          <Field
            label="What happens"
            htmlFor="exp-description"
            required
            hint="Be specific about the day. At least 30 characters."
          >
            <Textarea
              id="exp-description"
              required
              minLength={30}
              maxLength={8000}
              className="min-h-40"
              value={values.description}
              onChange={(event) => set({ description: event.target.value })}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" htmlFor="exp-category" required>
              <Select
                id="exp-category"
                required
                value={values.category}
                onChange={(event) => set({ category: event.target.value })}
              >
                <option value="">Choose a category</option>
                {(categories.data?.categories ?? []).map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Cancellation policy" htmlFor="exp-cancel">
              <Select
                id="exp-cancel"
                value={values.cancellationPolicy}
                onChange={(event) => set({ cancellationPolicy: event.target.value })}
              >
                <option value="FLEXIBLE">Flexible</option>
                <option value="MODERATE">Moderate</option>
                <option value="STRICT">Strict</option>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Duration (minutes)" htmlFor="exp-duration" required>
              <Input
                id="exp-duration"
                required
                type="number"
                min={15}
                max={1440}
                value={values.durationMin}
                onChange={(event) => set({ durationMin: event.target.value })}
              />
            </Field>
            <Field label="Maximum seats" htmlFor="exp-seats" required>
              <Input
                id="exp-seats"
                required
                type="number"
                min={1}
                max={60}
                value={values.maxSeats}
                onChange={(event) => set({ maxSeats: event.target.value })}
              />
            </Field>
            <Field label="Price per person (rupees)" htmlFor="exp-price" required>
              <Input
                id="exp-price"
                required
                type="number"
                min={0}
                step="1"
                value={values.priceRupees}
                onChange={(event) => set({ priceRupees: event.target.value })}
              />
            </Field>
          </div>

          <Field label="Meeting point" htmlFor="exp-meeting" required>
            <Input
              id="exp-meeting"
              required
              minLength={3}
              maxLength={160}
              value={values.meetingLabel}
              onChange={(event) => set({ meetingLabel: event.target.value })}
              placeholder="Ujire bus stand, opposite the temple gate"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Longitude" htmlFor="exp-lng" required>
              <Input
                id="exp-lng"
                required
                type="number"
                step="0.000001"
                value={values.lng}
                onChange={(event) => set({ lng: event.target.value })}
              />
            </Field>
            <Field label="Latitude" htmlFor="exp-lat" required>
              <Input
                id="exp-lat"
                required
                type="number"
                step="0.000001"
                value={values.lat}
                onChange={(event) => set({ lat: event.target.value })}
              />
            </Field>
            <Field label="City" htmlFor="exp-city" required>
              <Input
                id="exp-city"
                required
                value={values.city}
                onChange={(event) => set({ city: event.target.value })}
              />
            </Field>
            <Field label="State" htmlFor="exp-state" required>
              <Input
                id="exp-state"
                required
                value={values.state}
                onChange={(event) => set({ state: event.target.value })}
              />
            </Field>
          </div>

          <Field label="Languages" htmlFor="exp-languages" hint="Comma separated, e.g. en, kn, hi">
            <Input
              id="exp-languages"
              value={values.languages}
              onChange={(event) => set({ languages: event.target.value })}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Included" htmlFor="exp-inclusions" hint="One per line.">
              <Textarea
                id="exp-inclusions"
                value={values.inclusions}
                onChange={(event) => set({ inclusions: event.target.value })}
              />
            </Field>
            <Field label="Not included" htmlFor="exp-exclusions" hint="One per line.">
              <Textarea
                id="exp-exclusions"
                value={values.exclusions}
                onChange={(event) => set({ exclusions: event.target.value })}
              />
            </Field>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-danger-500">
              {describeError(error).description}
            </p>
          ) : null}

          <div>
            <Button type="submit" loading={pending}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}