import { useQuery } from '@tanstack/react-query';
import { type Paginated, type Story, type StoryCard } from '@/lib/types';
import { type StoryListQuery } from '@/lib/validation';
import { api } from '@/user/lib/api';
import { queryKeys } from '@/user/lib/query-keys';

/** Published stories, newest first, or text-ranked when `q` is present. */
export function useStories(params: Partial<StoryListQuery> = {}) {
  return useQuery({
    queryKey: queryKeys.stories(params),
    queryFn: () => api.get<Paginated<StoryCard>>('/stories', params as never),
  });
}

export function useStory(slug: string) {
  return useQuery({
    queryKey: queryKeys.story(slug),
    queryFn: () => api.get<{ story: Story }>(`/stories/${slug}`),
    enabled: Boolean(slug),
  });
}
