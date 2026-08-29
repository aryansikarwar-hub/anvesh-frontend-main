'use client';

import { useState } from 'react';
import { Button, Card, CardContent, Field, PageHeader, PageShell, Select } from '@/ui';
import { useUpdatePreferences } from '@/user/hooks/use-personal';
import { useCategories } from '@/user/hooks/use-discovery';
import { useCurrentUser } from '@/user/hooks/use-session';
import { RequireAuth } from '@/user/components/require-auth';
import { describeError } from '@/user/lib/api';

export default function PreferencesPage() {
  return (
    <PageShell className="flex flex-col gap-6 py-8">
      <PageHeader
        eyebrow="Account"
        title="Preferences"
        description="These feed the preference-match term in the ranking, so they change what you see."
      />
      <RequireAuth>
        <PreferencesForm />
      </RequireAuth>
    </PageShell>
  );
}

function PreferencesForm() {
  const { user } = useCurrentUser();
  const categories = useCategories();
  const update = useUpdatePreferences();
  const [form, setForm] = useState({
    interests: user?.preferences.interests ?? [],
    budgetBand: user?.preferences.budgetBand ?? 'MID',
    crowdTolerance: user?.preferences.crowdTolerance ?? 0.4,
    prefersLocalOwned: user?.preferences.prefersLocalOwned ?? true,
  });

  if (!user) return null;

  function toggleInterest(slug: string) {
    setForm((current) => ({
      ...current,
      interests: current.interests.includes(slug)
        ? current.interests.filter((value) => value !== slug)
        : [...current.interests, slug].slice(0, 20),
    }));
  }

  return (
    <Card className="max-w-2xl">
      <CardContent className="pt-5">
        <form
          className="flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            update.mutate(form);
          }}
        >
          <fieldset className="flex flex-col gap-2">
            <legend className="pb-1 text-sm font-medium text-ink-soft">
              What are you interested in? (up to 20)
            </legend>
            <div className="flex flex-wrap gap-2">
              {(categories.data?.categories ?? []).map((category) => {
                const active = form.interests.includes(category.slug);
                return (
                  <button
                    key={category.slug}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleInterest(category.slug)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? 'border-laterite-500 bg-laterite-50 text-laterite-600'
                        : 'border-line-strong text-ink-soft hover:bg-paper-sunk'
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Field
            label="Crowd tolerance"
            htmlFor="pref-crowd"
            hint="Lower means Anvesh pushes quieter places harder for you."
          >
            <Select
              id="pref-crowd"
              value={form.crowdTolerance}
              onChange={(event) =>
                setForm({ ...form, crowdTolerance: Number(event.target.value) })
              }
            >
              <option value={0.1}>I want it empty</option>
              <option value={0.3}>Prefer quiet</option>
              <option value={0.5}>Do not mind either way</option>
              <option value={0.8}>Busy is fine</option>
            </Select>
          </Field>

          <Field label="Budget" htmlFor="pref-budget">
            <Select
              id="pref-budget"
              value={form.budgetBand}
              onChange={(event) =>
                setForm({ ...form, budgetBand: event.target.value as typeof form.budgetBand })
              }
            >
              <option value="LOW">Low</option>
              <option value="MID">Mid</option>
              <option value="HIGH">High</option>
            </Select>
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.prefersLocalOwned}
              onChange={(event) => setForm({ ...form, prefersLocalOwned: event.target.checked })}
              className="size-4 rounded border-line-strong"
            />
            Prefer locally owned places and guides
          </label>

          {update.isError ? (
            <p role="alert" className="text-sm text-danger-500">
              {describeError(update.error).description}
            </p>
          ) : null}
          {update.isSuccess ? (
            <p role="status" className="text-sm text-ghat-500">
              Preferences saved. Your feed will reflect them straight away.
            </p>
          ) : null}

          <div>
            <Button type="submit" loading={update.isPending}>
              Save preferences
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}