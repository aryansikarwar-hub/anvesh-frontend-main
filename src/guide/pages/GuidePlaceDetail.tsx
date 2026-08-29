'use client';

import { Link } from '@/guide/router';
import { useParams } from '@/guide/router';
import { Send } from 'lucide-react';
import { Button, Card, CardContent, Money, PageHeader, StatTile } from '@/ui';
import { useMyPlace, usePlaceMutations } from '@/guide/hooks/use-guide';
import { QueryBoundary } from '@/guide/components/query-boundary';
import { RequireAuth } from '@/guide/components/require-auth';
import { ContentStatusBadge } from '@/guide/components/status-badge';

export default function GuidePlaceDetail() {
  const { id } = useParams() as { id: string };
  return (
    <RequireAuth>
      <PlaceDetail id={id} />
    </RequireAuth>
  );
}

function PlaceDetail({ id }: { id: string }) {
  const query = useMyPlace(id);
  const mutations = usePlaceMutations();

  return (
    <QueryBoundary
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      data={query.data}
      onRetry={() => void query.refetch()}
      skeleton="rows"
    >
      {({ place }) => (
        <div className="flex flex-col gap-6">
          <PageHeader
            eyebrow="Place"
            title={place.title}
            description={`${place.address.city}, ${place.address.state}`}
            actions={
              <div className="flex gap-2">
                <Button asChild variant="secondary">
                  <Link href={`/places/${place.id}/edit`}>Edit</Link>
                </Button>
                {place.status === 'DRAFT' || place.status === 'REJECTED' ? (
                  <Button
                    loading={mutations.submit.isPending}
                    onClick={() => mutations.submit.mutate(place.id)}
                  >
                    <Send aria-hidden="true" />
                    Submit for review
                  </Button>
                ) : null}
              </div>
            }
          />

          <div className="flex items-center gap-2">
            <ContentStatusBadge status={place.status} />
            <span className="text-sm text-ink-muted">/places/{place.slug}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Views" value={place.signals.viewCount} />
            <StatTile label="Saves" value={place.signals.saveCount} />
            <StatTile
              label="Rating"
              value={place.signals.ratingCount > 0 ? place.signals.ratingAvg.toFixed(1) : '—'}
              hint={`${place.signals.ratingCount} reviews`}
            />
            <StatTile
              label="Entry fee"
              value={
                place.details.entryFeeMinor === 0 ? (
                  'Free'
                ) : (
                  <Money minor={place.details.entryFeeMinor} />
                )
              }
            />
          </div>

          <Card>
            <CardContent className="flex flex-col gap-3 pt-5">
              <h2 className="text-lg">Discovery signals</h2>
              <p className="text-sm text-ink-muted">
                Popularity and crowd level are measured from real traveller behaviour and reviews.
                They are shown here so you can see them, but they are not editable — and both count
                against the place in ranking.
              </p>
              <dl className="grid gap-3 sm:grid-cols-3">
                <Signal label="Quality" value={place.signals.qualityScore} />
                <Signal label="Authenticity" value={place.signals.authenticityScore} />
                <Signal label="Locally owned" value={place.signals.localOwnership} />
                <Signal label="Uniqueness" value={place.signals.uniquenessScore} />
                <Signal label="Popularity (penalty)" value={place.signals.popularityScore} penalty />
                <Signal label="Crowd level (penalty)" value={place.signals.crowdLevel} penalty />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <h2 className="pb-2 text-lg">Description</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                {place.description}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </QueryBoundary>
  );
}

function Signal({ label, value, penalty }: { label: string; value: number; penalty?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className={`font-display text-lg ${penalty ? 'text-danger-500' : 'text-ghat-500'}`}>
        {(value * 100).toFixed(0)}%
      </dd>
    </div>
  );
}