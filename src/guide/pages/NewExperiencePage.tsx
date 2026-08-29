'use client';

import { useRouter } from '@/guide/router';
import { PageHeader } from '@/ui';
import { useExperienceMutations } from '@/guide/hooks/use-guide';
import { ExperienceForm, toExperienceValues } from '@/guide/components/experience-form';
import { RequireAuth } from '@/guide/components/require-auth';

export default function NewExperiencePage() {
  const router = useRouter();
  const mutations = useExperienceMutations();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Content"
        title="New experience"
        description="Saved as a draft. Add availability before you submit it."
      />
      <RequireAuth>
        <ExperienceForm
          initial={toExperienceValues()}
          submitLabel="Save draft"
          pending={mutations.create.isPending}
          error={mutations.create.error}
          onSubmit={(payload) =>
            mutations.create.mutate(payload, {
              onSuccess: ({ experience }) => router.push(`/experiences/${experience.id}`),
            })
          }
        />
      </RequireAuth>
    </div>
  );
}