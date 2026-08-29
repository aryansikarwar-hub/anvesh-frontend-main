'use client';

import { useRouter } from '@/guide/router';
import { useParams } from '@/guide/router';
import { PageHeader } from '@/ui';
import { useMyPlace, usePlaceMutations } from '@/guide/hooks/use-guide';
import { PlaceForm, toFormValues } from '@/guide/components/place-form';
import { QueryBoundary } from '@/guide/components/query-boundary';
import { RequireAuth } from '@/guide/components/require-auth';

export default function EditPlacePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const query = useMyPlace(id);
  const mutations = usePlaceMutations();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Place" title="Edit place" description="Changes go live once approved." />
      <RequireAuth>
        <QueryBoundary
          isLoading={query.isLoading}
          isError={query.isError}
          error={query.error}
          data={query.data}
          onRetry={() => void query.refetch()}
          skeleton="rows"
        >
          {({ place }) => (
            <PlaceForm
              initial={toFormValues(place)}
              submitLabel="Save changes"
              pending={mutations.update.isPending}
              error={mutations.update.error}
              onSubmit={(payload) =>
                mutations.update.mutate(
                  { id, patch: payload },
                  { onSuccess: () => router.push(`/places/${id}`) },
                )
              }
            />
          )}
        </QueryBoundary>
      </RequireAuth>
    </div>
  );
}