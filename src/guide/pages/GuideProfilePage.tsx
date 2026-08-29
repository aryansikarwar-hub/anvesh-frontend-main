'use client';

import { useState } from 'react';
import { type GuideProfile } from '@/lib/types';
import { Badge, Button, Card, CardContent, Field, Input, PageHeader, Textarea } from '@/ui';
import { useGuideProfile, useUpdateGuideProfile } from '@/guide/hooks/use-guide';
import { QueryBoundary } from '@/guide/components/query-boundary';
import { RequireAuth } from '@/guide/components/require-auth';
import { describeError } from '@/guide/lib/api';

export default function GuideProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Account"
        title="Guide profile"
        description="What travellers see on your public page and on every place you add."
      />
      <RequireAuth>
        <ProfileEditor />
      </RequireAuth>
    </div>
  );
}

function ProfileEditor() {
  const query = useGuideProfile();
  const update = useUpdateGuideProfile();

  return (
    <QueryBoundary
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      data={query.data}
      onRetry={() => void query.refetch()}
      skeleton="rows"
    >
      {({ guide }) => <ProfileForm guide={guide} update={update} />}
    </QueryBoundary>
  );
}

function ProfileForm({
  guide,
  update,
}: {
  guide: GuideProfile;
  update: ReturnType<typeof useUpdateGuideProfile>;
}) {
  const [form, setForm] = useState({
    displayName: guide.displayName,
    headline: guide.headline,
    bio: guide.bio,
    baseCity: guide.baseCity,
    baseState: guide.baseState,
    yearsExperience: String(guide.yearsExperience),
    languages: guide.languages.join(', '),
    specialities: guide.specialities.join(', '),
  });

  return (
    <Card className="max-w-3xl">
      <CardContent className="pt-5">
        <div className="flex items-center gap-2 pb-4">
          {guide.verified ? (
            <Badge variant="success">Verified</Badge>
          ) : (
            <Badge variant="warn">Awaiting verification</Badge>
          )}
          <span className="text-sm text-ink-muted">/guides/{guide.slug}</span>
        </div>

        {!guide.verified ? (
          <p className="mb-4 rounded-[var(--radius-control)] bg-[#fdf7e8] p-3 text-sm text-ink-soft">
            An admin verifies guide profiles. Until then you can add places, but you cannot publish
            bookable experiences.
          </p>
        ) : null}

        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            update.mutate({
              displayName: form.displayName,
              headline: form.headline,
              bio: form.bio,
              baseCity: form.baseCity,
              baseState: form.baseState,
              yearsExperience: Number(form.yearsExperience),
              languages: form.languages
                .split(',')
                .map((value) => value.trim())
                .filter(Boolean),
              specialities: form.specialities
                .split(',')
                .map((value) => value.trim())
                .filter(Boolean),
            });
          }}
        >
          <Field label="Display name" htmlFor="guide-name" required>
            <Input
              id="guide-name"
              required
              minLength={2}
              maxLength={80}
              value={form.displayName}
              onChange={(event) => setForm({ ...form, displayName: event.target.value })}
            />
          </Field>

          <Field
            label="Headline"
            htmlFor="guide-headline"
            required
            hint="One line. What you actually do, and where."
          >
            <Input
              id="guide-headline"
              required
              minLength={4}
              maxLength={140}
              value={form.headline}
              onChange={(event) => setForm({ ...form, headline: event.target.value })}
            />
          </Field>

          <Field label="About you" htmlFor="guide-bio">
            <Textarea
              id="guide-bio"
              maxLength={2000}
              className="min-h-32"
              value={form.bio}
              onChange={(event) => setForm({ ...form, bio: event.target.value })}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Base city" htmlFor="guide-city" required>
              <Input
                id="guide-city"
                required
                value={form.baseCity}
                onChange={(event) => setForm({ ...form, baseCity: event.target.value })}
              />
            </Field>
            <Field label="Base state" htmlFor="guide-state" required>
              <Input
                id="guide-state"
                required
                value={form.baseState}
                onChange={(event) => setForm({ ...form, baseState: event.target.value })}
              />
            </Field>
            <Field label="Years guiding" htmlFor="guide-years">
              <Input
                id="guide-years"
                type="number"
                min={0}
                max={70}
                value={form.yearsExperience}
                onChange={(event) => setForm({ ...form, yearsExperience: event.target.value })}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Languages" htmlFor="guide-languages" hint="Comma separated.">
              <Input
                id="guide-languages"
                value={form.languages}
                onChange={(event) => setForm({ ...form, languages: event.target.value })}
              />
            </Field>
            <Field label="Specialities" htmlFor="guide-specialities" hint="Comma separated.">
              <Input
                id="guide-specialities"
                value={form.specialities}
                onChange={(event) => setForm({ ...form, specialities: event.target.value })}
              />
            </Field>
          </div>

          {update.isError ? (
            <p role="alert" className="text-sm text-danger-500">
              {describeError(update.error).description}
            </p>
          ) : null}
          {update.isSuccess ? (
            <p role="status" className="text-sm text-ghat-500">
              Profile saved. It is copied onto your places within a few minutes.
            </p>
          ) : null}

          <div>
            <Button type="submit" loading={update.isPending}>
              Save profile
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}