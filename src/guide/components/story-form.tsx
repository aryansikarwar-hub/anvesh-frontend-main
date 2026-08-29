'use client';

import { useState } from 'react';
import { Button, Card, CardContent, Field, Input, Select, Textarea } from '@/ui';
import { STORY_KINDS, type Story, type StoryKind } from '@/lib/types';
import { STORY_KIND_LABELS } from '@/ui';
import { type StoryCreateInput } from '@/lib/validation';
import { useMyPlaces } from '@/guide/hooks/use-guide';
import { describeError } from '@/guide/lib/api';

export interface StoryFormValues {
  title: string;
  summary: string;
  body: string;
  kind: StoryKind;
  city: string;
  state: string;
  tags: string;
  placeIds: string[];
}

export function toStoryValues(story?: Story): StoryFormValues {
  return {
    title: story?.title ?? '',
    summary: story?.summary ?? '',
    body: story?.body ?? '',
    kind: story?.kind ?? 'CRAFT',
    city: story?.city ?? '',
    state: story?.state ?? '',
    tags: story?.tags.join(', ') ?? '',
    placeIds: story?.places.map((place) => place.placeId) ?? [],
  };
}

const MIN_BODY = 200;

/**
 * The story editor.
 *
 * Two things are shown honestly rather than hidden: the body has a real
 * minimum length, and the reading time is not an input — the server computes
 * it from the text, so there is nothing here to fill in.
 */
export function StoryForm({
  initial,
  submitLabel,
  pending,
  error,
  onSubmit,
}: {
  initial: StoryFormValues;
  submitLabel: string;
  pending: boolean;
  error: unknown;
  onSubmit: (payload: StoryCreateInput) => void;
}) {
  const [values, setValues] = useState(initial);
  const places = useMyPlaces({ page: 1 });

  const bodyLength = values.body.trim().length;
  const words = values.body.trim().split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.round(words / 200) || 1);

  function set<K extends keyof StoryFormValues>(key: K, value: StoryFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function togglePlace(placeId: string) {
    set(
      'placeIds',
      values.placeIds.includes(placeId)
        ? values.placeIds.filter((id) => id !== placeId)
        : [...values.placeIds, placeId].slice(0, 10),
    );
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          title: values.title.trim(),
          summary: values.summary.trim(),
          body: values.body.trim(),
          kind: values.kind,
          city: values.city.trim(),
          state: values.state.trim(),
          tags: values.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
            .slice(0, 8),
          placeIds: values.placeIds,
          coverImage: null,
        });
      }}
    >
      <Card>
        <CardContent className="grid gap-4 pt-5 sm:grid-cols-2">
          <Field label="Title" htmlFor="story-title" required>
            <Input
              id="story-title"
              required
              minLength={4}
              maxLength={160}
              value={values.title}
              onChange={(event) => set('title', event.target.value)}
              placeholder="The last families painting with boiled castor oil"
            />
          </Field>

          <Field label="Kind" htmlFor="story-kind" required>
            <Select
              id="story-kind"
              value={values.kind}
              onChange={(event) => set('kind', event.target.value as StoryKind)}
            >
              {STORY_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {STORY_KIND_LABELS[kind]}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Summary"
            htmlFor="story-summary"
            required
            hint="One or two sentences. This is what shows on the card."
          >
            <Textarea
              id="story-summary"
              required
              minLength={20}
              maxLength={300}
              className="min-h-20"
              value={values.summary}
              onChange={(event) => set('summary', event.target.value)}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City" htmlFor="story-city" required>
              <Input
                id="story-city"
                required
                maxLength={120}
                value={values.city}
                onChange={(event) => set('city', event.target.value)}
              />
            </Field>
            <Field label="State" htmlFor="story-state" required>
              <Input
                id="story-state"
                required
                maxLength={120}
                value={values.state}
                onChange={(event) => set('state', event.target.value)}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-5">
          <Field
            label="The story"
            htmlFor="story-body"
            required
            hint={`Plain text. Leave a blank line between paragraphs. At least ${MIN_BODY} characters.`}
            {...(bodyLength > 0 && bodyLength < MIN_BODY
              ? { error: `${MIN_BODY - bodyLength} more characters needed` }
              : {})}
          >
            <Textarea
              id="story-body"
              required
              minLength={MIN_BODY}
              maxLength={20_000}
              className="min-h-96 font-[inherit] leading-relaxed"
              value={values.body}
              onChange={(event) => set('body', event.target.value)}
              placeholder={
                'Start with the thing a listing cannot say.\n\nThen explain how it actually works, and what a visitor should do about it.'
              }
            />
          </Field>
          <p className="text-xs text-ink-muted">
            {words} words · about {readMinutes} min read. Reading time is computed from the text,
            not set by hand.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-5">
          <Field
            label="Tags"
            htmlFor="story-tags"
            hint="Up to eight, comma separated."
          >
            <Input
              id="story-tags"
              value={values.tags}
              onChange={(event) => set('tags', event.target.value)}
              placeholder="craft, kutch, textile"
            />
          </Field>

          <fieldset className="flex flex-col gap-2">
            <legend className="pb-1 text-sm font-medium text-ink-soft">
              Places this story is about
            </legend>
            <p className="pb-1 text-xs text-ink-muted">
              Only your published places can be linked. Up to ten.
            </p>
            <div className="flex flex-wrap gap-2">
              {(places.data?.items ?? [])
                .filter((place) => place.status === 'PUBLISHED')
                .map((place) => {
                  const selected = values.placeIds.includes(place.id);
                  return (
                    <button
                      key={place.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => togglePlace(place.id)}
                      className={
                        selected
                          ? 'rounded-[var(--radius-pill)] bg-ink px-3 py-1.5 text-[13px] font-medium text-paper-raised'
                          : 'rounded-[var(--radius-pill)] bg-paper-raised px-3 py-1.5 text-[13px] font-medium text-ink-soft ring-1 ring-line-strong/70 hover:bg-paper-sunk'
                      }
                    >
                      {place.title}
                    </button>
                  );
                })}
              {places.data?.items.filter((place) => place.status === 'PUBLISHED').length === 0 ? (
                <p className="text-sm text-ink-muted">
                  You have no published places yet, so there is nothing to link.
                </p>
              ) : null}
            </div>
          </fieldset>
        </CardContent>
      </Card>

      {error ? (
        <p role="alert" className="text-sm text-danger-500">
          {describeError(error).description}
        </p>
      ) : null}

      <div>
        <Button type="submit" loading={pending} disabled={bodyLength < MIN_BODY}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}