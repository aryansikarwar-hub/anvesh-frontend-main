'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button, Card, CardContent, Field, Input, PageHeader } from '@/ui';
import { type RankingParams, type RankingWeights } from '@/lib/types';
import {
  useRecommendationConfig,
  useUpdateRecommendationConfig,
  type RankingConfig,
} from '@/admin/hooks/use-admin';
import { QueryBoundary } from '@/admin/components/query-boundary';
import { RequireAuth } from '@/admin/components/require-auth';
import { describeError } from '@/admin/lib/api';

const POSITIVE_WEIGHTS: { key: keyof RankingWeights; label: string; help: string }[] = [
  { key: 'relevance', label: 'Relevance', help: 'Text match blended with proximity.' },
  { key: 'preferenceMatch', label: 'Preference match', help: "How well it fits the traveller's saved preferences." },
  { key: 'quality', label: 'Quality', help: 'Moderator-assessed and rating-derived quality.' },
  { key: 'authenticity', label: 'Authenticity', help: 'How untouched by tourism the place is.' },
  { key: 'localOwnership', label: 'Local ownership', help: 'Who actually owns and runs it.' },
  { key: 'freshness', label: 'Freshness', help: 'How recently the entry was verified.' },
  { key: 'uniqueness', label: 'Uniqueness', help: 'How hard it is to find something similar.' },
];

const PENALTY_WEIGHTS: { key: keyof RankingWeights; label: string; help: string }[] = [
  {
    key: 'popularityPenalty',
    label: 'Popularity penalty',
    help: 'Subtracted. The busier a place gets, the lower it ranks. Cannot be set to zero.',
  },
  {
    key: 'crowdPenalty',
    label: 'Crowd penalty',
    help: 'Subtracted. Driven by what reviewers report about crowding.',
  },
];

export default function RecommendationConfigPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Platform"
        title="Ranking configuration"
        description="These weights are the discovery algorithm. They live in the database, not in code."
      />
      <RequireAuth>
        <ConfigEditor />
      </RequireAuth>
    </div>
  );
}

function ConfigEditor() {
  const query = useRecommendationConfig();

  return (
    <QueryBoundary
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      data={query.data}
      onRetry={() => void query.refetch()}
      skeleton="rows"
    >
      {(data) => <ConfigForm config={data.active} />}
    </QueryBoundary>
  );
}

function ConfigForm({ config }: { config: RankingConfig }) {
  const update = useUpdateRecommendationConfig();
  const [weights, setWeights] = useState<RankingWeights>(config.weights);
  const [params, setParams] = useState<RankingParams>(config.params);

  return (
    <form
      className="flex max-w-3xl flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        update.mutate({ weights, params });
      }}
    >
      <Card>
        <CardContent className="flex flex-col gap-4 pt-5">
          <div>
            <h2 className="text-lg">Positive signals</h2>
            <p className="text-sm text-ink-muted">
              Added to the score. Version {config.version} is currently active.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {POSITIVE_WEIGHTS.map((weight) => (
              <Field key={weight.key} label={weight.label} htmlFor={`w-${weight.key}`} hint={weight.help}>
                <Input
                  id={`w-${weight.key}`}
                  type="number"
                  step="0.05"
                  min={0}
                  max={5}
                  value={weights[weight.key]}
                  onChange={(event) =>
                    setWeights({ ...weights, [weight.key]: Number(event.target.value) })
                  }
                />
              </Field>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-laterite-200">
        <CardContent className="flex flex-col gap-4 pt-5">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-laterite-600" aria-hidden="true" />
            <div>
              <h2 className="text-lg">Penalties</h2>
              <p className="text-sm text-ink-soft">
                These are subtracted. This is the product principle: popularity is a penalty, never
                a boost. The API and the database both refuse a value below 0.05, so these cannot be
                turned off from here or from a direct database write.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {PENALTY_WEIGHTS.map((weight) => (
              <Field key={weight.key} label={weight.label} htmlFor={`w-${weight.key}`} hint={weight.help}>
                <Input
                  id={`w-${weight.key}`}
                  type="number"
                  step="0.05"
                  min={0.05}
                  max={5}
                  required
                  value={weights[weight.key]}
                  onChange={(event) =>
                    setWeights({ ...weights, [weight.key]: Number(event.target.value) })
                  }
                />
              </Field>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-5">
          <h2 className="text-lg">Parameters</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Freshness half-life (days)"
              htmlFor="p-freshness"
              hint="How quickly a verified entry loses its freshness bonus."
            >
              <Input
                id="p-freshness"
                type="number"
                min={1}
                max={3650}
                value={params.freshnessHalfLifeDays}
                onChange={(event) =>
                  setParams({ ...params, freshnessHalfLifeDays: Number(event.target.value) })
                }
              />
            </Field>
            <Field label="Distance decay (km)" htmlFor="p-distance">
              <Input
                id="p-distance"
                type="number"
                min={1}
                max={1000}
                value={params.distanceDecayKm}
                onChange={(event) =>
                  setParams({ ...params, distanceDecayKm: Number(event.target.value) })
                }
              />
            </Field>
            <Field
              label="Max candidates"
              htmlFor="p-candidates"
              hint="How many documents are scored per query."
            >
              <Input
                id="p-candidates"
                type="number"
                min={20}
                max={2000}
                value={params.maxCandidates}
                onChange={(event) =>
                  setParams({ ...params, maxCandidates: Number(event.target.value) })
                }
              />
            </Field>
            <Field label="Minimum quality" htmlFor="p-quality">
              <Input
                id="p-quality"
                type="number"
                step="0.05"
                min={0}
                max={1}
                value={params.minQuality}
                onChange={(event) => setParams({ ...params, minQuality: Number(event.target.value) })}
              />
            </Field>
            <Field
              label="Hidden gem: max popularity"
              htmlFor="p-gem-pop"
              hint="Above this, a place stops being a hidden gem."
            >
              <Input
                id="p-gem-pop"
                type="number"
                step="0.05"
                min={0}
                max={1}
                value={params.hiddenGemPopularityMax}
                onChange={(event) =>
                  setParams({ ...params, hiddenGemPopularityMax: Number(event.target.value) })
                }
              />
            </Field>
            <Field label="Hidden gem: min quality" htmlFor="p-gem-quality">
              <Input
                id="p-gem-quality"
                type="number"
                step="0.05"
                min={0}
                max={1}
                value={params.hiddenGemMinQuality}
                onChange={(event) =>
                  setParams({ ...params, hiddenGemMinQuality: Number(event.target.value) })
                }
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {update.isError ? (
        <p role="alert" className="text-sm text-danger-500">
          {describeError(update.error).description}
        </p>
      ) : null}
      {update.isSuccess ? (
        <p role="status" className="text-sm text-ghat-500">
          Saved as version {update.data.config.version}. Cached scores refresh within five minutes,
          and precomputed discovery scores on the next nightly run.
        </p>
      ) : null}

      <div>
        <Button type="submit" loading={update.isPending}>
          Save new version
        </Button>
      </div>
    </form>
  );
}