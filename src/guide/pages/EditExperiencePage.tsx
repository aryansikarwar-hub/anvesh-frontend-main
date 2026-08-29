'use client';

import { useRouter } from '@/guide/router';
import { useParams } from '@/guide/router';
import { PageHeader } from '@/ui';
import { useExperienceMutations, useMyExperience } from '@/guide/hooks/use-guide';
import { ExperienceForm, toExperienceValues } from '@/guide/components/experience-form';
import { QueryBoundary } from '@/guide/components/query-boundary';
import { RequireAuth } from '@/guide/components/require-auth';

export default function EditExperiencePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const query = useMyExperience(id);
  const mutations = useExperienceMutations();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Experience" title="Edit experience" />
      <RequireAuth>
        <QueryBoundary
          isLoading={query.isLoading}
          isError={query.isError}
          error={query.error}
          data={query.data}
          onRetry={() => void query.refetch()}
          skeleton="rows"
        >
          {({ experience }) => (
            <ExperienceForm
              initial={toExperienceValues(experience)}
              submitLabel="Save changes"
              pending={mutations.update.isPending}
              error={mutations.update.error}
              onSubmit={(payload) =>
                mutations.update.mutate(
                  { id, patch: payload },
                  { onSuccess: () => router.push(`/experiences/${id}`) },
                )
              }
            />
          )}
        </QueryBoundary>
      </RequireAuth>
    </div>
  );
}