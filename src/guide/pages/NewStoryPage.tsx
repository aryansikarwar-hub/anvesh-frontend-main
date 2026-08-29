'use client';

import { useRouter } from '@/guide/router';
import { PageHeader } from '@/ui';
import { useStoryMutations } from '@/guide/hooks/use-guide';
import { StoryForm, toStoryValues } from '@/guide/components/story-form';
import { RequireAuth } from '@/guide/components/require-auth';

export default function NewStoryPage() {
  const router = useRouter();
  const mutations = useStoryMutations();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Content"
        title="Write a story"
        description="Saved as a draft. Submit it when you are happy, and a moderator reviews it before travellers can read it."
      />
      <RequireAuth>
        <StoryForm
          initial={toStoryValues()}
          submitLabel="Save draft"
          pending={mutations.create.isPending}
          error={mutations.create.error}
          onSubmit={(payload) =>
            mutations.create.mutate(payload, {
              onSuccess: ({ story }) => router.push(`/stories/${story.id}`),
            })
          }
        />
      </RequireAuth>
    </div>
  );
}