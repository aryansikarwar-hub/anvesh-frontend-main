'use client';

import { Link } from '@/guide/router';
import { useParams } from '@/guide/router';
import { Send } from 'lucide-react';
import { Button, Card, CardContent, Money, PageHeader, StatTile } from '@/ui';
import { useExperienceMutations, useMyExperience } from '@/guide/hooks/use-guide';
import { QueryBoundary } from '@/guide/components/query-boundary';
import { RequireAuth } from '@/guide/components/require-auth';
import { ContentStatusBadge } from '@/guide/components/status-badge';

export default function GuideExperienceDetail() {
  const { id } = useParams() as { id: string };
  return (
    <RequireAuth>
      <ExperienceDetail id={id} />
    </RequireAuth>
  );
}

function ExperienceDetail({ id }: { id: string }) {
  const query = useMyExperience(id);
  const mutations = useExperienceMutations();

  return (
    <QueryBoundary
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      data={query.data}
      onRetry={() => void query.refetch()}
      skeleton="rows"
    >
      {({ experience }) => (
        <div className="flex flex-col gap-6">
          <PageHeader
            eyebrow="Experience"
            title={experience.title}
            description={experience.summary}
            actions={
              <div className="flex gap-2">
                <Button asChild variant="secondary">
                  <Link href={`/experiences/${experience.id}/edit`}>Edit</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href={`/availability?experienceId=${experience.id}`}>Availability</Link>
                </Button>
                {experience.status === 'DRAFT' || experience.status === 'REJECTED' ? (
                  <Button
                    loading={mutations.submit.isPending}
                    onClick={() => mutations.submit.mutate(experience.id)}
                  >
                    <Send aria-hidden="true" />
                    Submit
                  </Button>
                ) : null}
              </div>
            }
          />

          <ContentStatusBadge status={experience.status} />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Price" value={<Money minor={experience.basePriceMinor} />} />
            <StatTile label="Duration" value={`${Math.round(experience.durationMin / 60)}h`} />
            <StatTile label="Max seats" value={experience.maxSeats} />
            <StatTile
              label="Rating"
              value={
                experience.signals.ratingCount > 0 ? experience.signals.ratingAvg.toFixed(1) : '—'
              }
              hint={`${experience.signals.ratingCount} reviews`}
            />
          </div>

          <Card>
            <CardContent className="pt-5">
              <h2 className="pb-2 text-lg">What happens</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                {experience.description}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </QueryBoundary>
  );
}