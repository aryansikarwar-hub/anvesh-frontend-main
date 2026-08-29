'use client';

import { useState } from 'react';
import { Button, Card, CardContent, Field, Input, Select, Textarea } from '@/ui';
import { type Place } from '@/lib/types';
import { useCategories } from '@/guide/hooks/use-guide';
import { describeError } from '@/guide/lib/api';

export interface PlaceFormValues {
  title: string;
  summary: string;
  description: string;
  category: string;
  lng: string;
  lat: string;
  city: string;
  district: string;
  state: string;
  ownership: string;
  entryFeeRupees: string;
  durationMin: string;
  tips: string;
  localOwnership: string;
  authenticityScore: string;
  uniquenessScore: string;
}

export function toFormValues(place?: Place): PlaceFormValues {
  return {
    title: place?.title ?? '',
    summary: place?.summary ?? '',
    description: place?.description ?? '',
    category: place?.categorySlugs[0] ?? '',
    lng: place ? String(place.location.coordinates[0]) : '',
    lat: place ? String(place.location.coordinates[1]) : '',
    city: place?.address.city ?? '',
    district: place?.address.district ?? '',
    state: place?.address.state ?? '',
    ownership: place?.ownership ?? 'LOCAL_OWNED',
    entryFeeRupees: place ? String(place.details.entryFeeMinor / 100) : '0',
    durationMin: place ? String(place.details.durationMin) : '120',
    tips: place?.details.tips.join('\n') ?? '',
    localOwnership: place ? String(place.signals.localOwnership) : '0.8',
    authenticityScore: place ? String(place.signals.authenticityScore) : '0.7',
    uniquenessScore: place ? String(place.signals.uniquenessScore) : '0.6',
  };
}

/** Converts the form to the API payload. Money becomes integer paise here. */
export function toPayload(values: PlaceFormValues): Record<string, unknown> {
  return {
    title: values.title,
    summary: values.summary,
    description: values.description,
    categorySlugs: [values.category],
    location: { type: 'Point', coordinates: [Number(values.lng), Number(values.lat)] },
    address: {
      city: values.city,
      ...(values.district ? { district: values.district } : {}),
      state: values.state,
      country: 'IN',
    },
    details: {
      entryFeeMinor: Math.round(Number(values.entryFeeRupees) * 100),
      durationMin: Number(values.durationMin),
      bestTimeMonths: [],
      accessibility: [],
      amenities: [],
      tips: values.tips
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 10),
    },
    ownership: values.ownership,
    selfDeclared: {
      localOwnership: Number(values.localOwnership),
      authenticityScore: Number(values.authenticityScore),
      uniquenessScore: Number(values.uniquenessScore),
    },
    destinationId: null,
  };
}

export function PlaceForm({
  initial,
  submitLabel,
  onSubmit,
  pending,
  error,
}: {
  initial: PlaceFormValues;
  submitLabel: string;
  onSubmit: (payload: Record<string, unknown>) => void;
  pending: boolean;
  error: unknown;
}) {
  const [values, setValues] = useState(initial);
  const categories = useCategories();

  function set(patch: Partial<PlaceFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  return (
    <Card className="max-w-3xl">
      <CardContent className="pt-5">
        <form
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(toPayload(values));
          }}
        >
          <Field label="Title" htmlFor="place-title" required>
            <Input
              id="place-title"
              required
              minLength={3}
              maxLength={140}
              value={values.title}
              onChange={(event) => set({ title: event.target.value })}
            />
          </Field>

          <Field
            label="One-line summary"
            htmlFor="place-summary"
            required
            hint="What a traveller sees on a card. 10 to 300 characters."
          >
            <Input
              id="place-summary"
              required
              minLength={10}
              maxLength={300}
              value={values.summary}
              onChange={(event) => set({ summary: event.target.value })}
            />
          </Field>

          <Field label="Description" htmlFor="place-description" required hint="At least 30 characters.">
            <Textarea
              id="place-description"
              required
              minLength={30}
              maxLength={8000}
              className="min-h-40"
              value={values.description}
              onChange={(event) => set({ description: event.target.value })}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" htmlFor="place-category" required>
              <Select
                id="place-category"
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
            <Field label="Ownership" htmlFor="place-ownership">
              <Select
                id="place-ownership"
                value={values.ownership}
                onChange={(event) => set({ ownership: event.target.value })}
              >
                <option value="LOCAL_OWNED">Locally owned</option>
                <option value="COMMUNITY">Community run</option>
                <option value="GOVERNMENT">Government</option>
                <option value="CHAIN">Chain</option>
                <option value="UNKNOWN">Not sure</option>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Longitude"
              htmlFor="place-lng"
              required
              hint="Longitude first, as GeoJSON expects."
            >
              <Input
                id="place-lng"
                required
                type="number"
                step="0.000001"
                min={-180}
                max={180}
                value={values.lng}
                onChange={(event) => set({ lng: event.target.value })}
              />
            </Field>
            <Field label="Latitude" htmlFor="place-lat" required>
              <Input
                id="place-lat"
                required
                type="number"
                step="0.000001"
                min={-90}
                max={90}
                value={values.lat}
                onChange={(event) => set({ lat: event.target.value })}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="City" htmlFor="place-city" required>
              <Input
                id="place-city"
                required
                value={values.city}
                onChange={(event) => set({ city: event.target.value })}
              />
            </Field>
            <Field label="District" htmlFor="place-district">
              <Input
                id="place-district"
                value={values.district}
                onChange={(event) => set({ district: event.target.value })}
              />
            </Field>
            <Field label="State" htmlFor="place-state" required>
              <Input
                id="place-state"
                required
                value={values.state}
                onChange={(event) => set({ state: event.target.value })}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Entry fee (rupees)" htmlFor="place-fee" hint="0 for free entry.">
              <Input
                id="place-fee"
                type="number"
                min={0}
                step="1"
                value={values.entryFeeRupees}
                onChange={(event) => set({ entryFeeRupees: event.target.value })}
              />
            </Field>
            <Field label="Typical visit (minutes)" htmlFor="place-duration">
              <Input
                id="place-duration"
                type="number"
                min={0}
                max={2880}
                value={values.durationMin}
                onChange={(event) => set({ durationMin: event.target.value })}
              />
            </Field>
          </div>

          <Field
            label="Practical notes"
            htmlFor="place-tips"
            hint="One per line, up to ten. Permits, timings, hazards, what to carry."
          >
            <Textarea
              id="place-tips"
              value={values.tips}
              onChange={(event) => set({ tips: event.target.value })}
            />
          </Field>

          <fieldset className="grid gap-4 rounded-[var(--radius-control)] border border-line p-4 sm:grid-cols-3">
            <legend className="px-1 text-sm font-medium text-ink-soft">
              How you would describe it
            </legend>
            <p className="col-span-full text-xs text-ink-muted">
              These three are self-declared and a moderator can override them. Crowd level and
              popularity are NOT here: those come from real traveller behaviour, so they cannot be
              gamed from this form.
            </p>
            <Field label="Locally owned" htmlFor="place-local">
              <Select
                id="place-local"
                value={values.localOwnership}
                onChange={(event) => set({ localOwnership: event.target.value })}
              >
                <option value="1">Entirely</option>
                <option value="0.8">Mostly</option>
                <option value="0.5">Mixed</option>
                <option value="0.2">Barely</option>
              </Select>
            </Field>
            <Field label="Authenticity" htmlFor="place-authentic">
              <Select
                id="place-authentic"
                value={values.authenticityScore}
                onChange={(event) => set({ authenticityScore: event.target.value })}
              >
                <option value="0.9">Untouched</option>
                <option value="0.7">Largely authentic</option>
                <option value="0.5">Some tourism</option>
                <option value="0.3">Heavily commercialised</option>
              </Select>
            </Field>
            <Field label="Uniqueness" htmlFor="place-unique">
              <Select
                id="place-unique"
                value={values.uniquenessScore}
                onChange={(event) => set({ uniquenessScore: event.target.value })}
              >
                <option value="0.9">One of a kind</option>
                <option value="0.6">Unusual</option>
                <option value="0.3">Fairly common</option>
              </Select>
            </Field>
          </fieldset>

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