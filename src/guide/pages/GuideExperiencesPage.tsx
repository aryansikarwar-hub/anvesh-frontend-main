'use client';

import { useState } from 'react';
import { Link } from '@/guide/router';
import { Plus, Send, Trash2 } from 'lucide-react';
import { Button, Card, CardContent, Money, PageHeader, Pagination } from '@/ui';
import { useExperienceMutations, useMyExperiences } from '@/guide/hooks/use-guide';
import { QueryBoundary } from '@/guide/components/query-boundary';
import { RequireAuth } from '@/guide/components/require-auth';
import { ContentStatusBadge } from '@/guide/components/status-badge';

export default function GuideExperiencesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Content"
        title="Experiences"
        description="Bookable, priced and run by you. Publishing needs a verified guide profile."
        actions={
          <Button asChild>
            <Link href="/experiences/new">
              <Plus aria-hidden="true" />
              New experience
            </Link>
          </Button>
        }
      />
      <RequireAuth>
        <ExperiencesList />
      </RequireAuth>
    </div>
  );
}

function ExperiencesList() {
  const [page, setPage] = useState(1);
  const experiences = useMyExperiences({ page });
  const mutations = useExperienceMutations();

  return (
    <QueryBoundary
      isLoading={experiences.isLoading}
      isError={experiences.isError}
      error={experiences.error}
      data={experiences.data}
      isEmpty={(data) => data.items.length === 0}
      onRetry={() => void experiences.refetch()}
      emptyTitle="No experiences yet"
      emptyDescription="An experience is what travellers actually book and pay for."
      emptyAction={
        <Button asChild>
          <Link href="/experiences/new">Create one</Link>
        </Button>
      }
      skeleton="rows"
    >
      {(data) => (
        <div className="flex flex-col gap-3">
          {data.items.map((experience) => (
            <Card key={experience.id}>
              <CardContent className="flex flex-wrap items-start justify-between gap-4 pt-5">
                <div>
                  <ContentStatusBadge status={experience.status} />
                  <h2 className="pt-1.5 text-lg">
                    <Link href={`/experiences/${experience.id}`} className="hover:underline">
                      {experience.title}
                    </Link>
                  </h2>
                  <p className="pt-0.5 text-sm text-ink-muted">
                    <Money minor={experience.basePriceMinor} suffix="per person" /> ·{' '}
                    {Math.round(experience.durationMin / 60)}h · up to {experience.maxSeats} people
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/experiences/${experience.id}/edit`}>Edit</Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/availability?experienceId=${experience.id}`}>Availability</Link>
                  </Button>
                  {experience.status === 'DRAFT' || experience.status === 'REJECTED' ? (
                    <Button
                      size="sm"
                      loading={mutations.submit.isPending}
                      onClick={() => mutations.submit.mutate(experience.id)}
                    >
                      <Send aria-hidden="true" />
                      Submit
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Archive ${experience.title}`}
                    onClick={() => mutations.remove.mutate(experience.id)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Pagination pageInfo={data.pageInfo} onPageChange={setPage} />
        </div>
      )}
    </QueryBoundary>
  );
}