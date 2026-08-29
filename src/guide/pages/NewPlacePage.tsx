'use client';

import { useRouter } from '@/guide/router';
import { PageHeader } from '@/ui';
import { usePlaceMutations } from '@/guide/hooks/use-guide';
import { PlaceForm, toFormValues } from '@/guide/components/place-form';
import { RequireAuth } from '@/guide/components/require-auth';

export default function NewPlacePage() {
  const router = useRouter();
  const mutations = usePlaceMutations();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Content"
        title="Add a place"
        description="Saved as a draft. Submit it when you are happy, and a moderator reviews it before it appears in discovery."
      />
      <RequireAuth>
        <PlaceForm
          initial={toFormValues()}
          submitLabel="Save draft"
          pending={mutations.create.isPending}
          error={mutations.create.error}
          onSubmit={(payload) =>
            mutations.create.mutate(payload, {
              onSuccess: ({ place }) => router.push(`/places/${place.id}`),
            })
          }
        />
      </RequireAuth>
    </div>
  );
}