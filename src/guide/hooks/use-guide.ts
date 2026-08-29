import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type AvailabilitySlot,
  type Booking,
  type Category,
  type Experience,
  type GuideEarnings,
  type GuideProfile,
  type Notification,
  type Paginated,
  type Place,
  type Review,
  type Story,
  type StoryCard,
} from '@/lib/types';
import { type StoryCreateInput, type StoryUpdateInput } from '@/lib/validation';
import { api } from '@/guide/lib/api';
import { queryKeys } from '@/guide/lib/query-keys';

export interface GuideDashboard {
  places: { total: number; published: number; pendingReview: number };
  experiences: { total: number; published: number };
  bookings: { upcoming: number; pendingPayment: number; completed: number };
  slots: { openNext30Days: number; seatsAvailable: number };
  reviews: { total: number; ratingAvg: number };
  earnings: { lifetimeNetMinor: number; pendingPayoutMinor: number; currency: 'INR' };
}

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => api.get<{ dashboard: GuideDashboard }>('/guides/me/dashboard'),
  });
}

export interface GuideAnalytics {
  windowDays: number;
  places: { id: string; title: string; slug: string; views: number; saves: number }[];
  daily: { day: string; type: string; count: number }[];
  bookingsInWindow: number;
  viewToBookingRate: number;
}

export function useAnalytics() {
  return useQuery({
    queryKey: queryKeys.analytics,
    queryFn: () => api.get<{ analytics: GuideAnalytics }>('/guides/me/analytics'),
  });
}

export function useGuideProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => api.get<{ guide: GuideProfile }>('/guides/me'),
  });
}

export function useUpdateGuideProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Record<string, unknown>) =>
      api.patch<{ guide: GuideProfile }>('/guides/me', patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

export function useUpdatePayout() {
  return useMutation({
    mutationFn: (input: Record<string, string>) =>
      api.put<{ masked: string }>('/guides/me/payout', input),
  });
}

export function useEarnings() {
  return useQuery({
    queryKey: queryKeys.earnings,
    queryFn: () => api.get<{ earnings: GuideEarnings }>('/guides/me/earnings'),
  });
}

export function useMyPlaces(params: { page?: number; status?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.places(params),
    queryFn: () => api.get<Paginated<Place>>('/guides/me/places', params as never),
  });
}

export function useMyPlace(id: string) {
  return useQuery({
    queryKey: queryKeys.place(id),
    queryFn: () => api.get<{ place: Place }>(`/guides/me/places/${id}`),
    enabled: Boolean(id),
  });
}

export function usePlaceMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['guide', 'places'] });

  return {
    create: useMutation({
      mutationFn: (input: Record<string, unknown>) =>
        api.post<{ place: Place }>('/guides/me/places', input),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) =>
        api.patch<{ place: Place }>(`/guides/me/places/${id}`, patch),
      onSuccess: invalidate,
    }),
    submit: useMutation({
      mutationFn: (id: string) => api.post<{ place: Place }>(`/guides/me/places/${id}/submit`, {}),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => api.delete<void>(`/guides/me/places/${id}`),
      onSuccess: invalidate,
    }),
  };
}

export function useMyExperiences(params: { page?: number; status?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.experiences(params),
    queryFn: () => api.get<Paginated<Experience>>('/guides/me/experiences', params as never),
  });
}

export function useMyExperience(id: string) {
  return useQuery({
    queryKey: queryKeys.experience(id),
    queryFn: () => api.get<{ experience: Experience }>(`/guides/me/experiences/${id}`),
    enabled: Boolean(id),
  });
}

export function useExperienceMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['guide', 'experiences'] });

  return {
    create: useMutation({
      mutationFn: (input: Record<string, unknown>) =>
        api.post<{ experience: Experience }>('/guides/me/experiences', input),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) =>
        api.patch<{ experience: Experience }>(`/guides/me/experiences/${id}`, patch),
      onSuccess: invalidate,
    }),
    submit: useMutation({
      mutationFn: (id: string) =>
        api.post<{ experience: Experience }>(`/guides/me/experiences/${id}/submit`, {}),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => api.delete<void>(`/guides/me/experiences/${id}`),
      onSuccess: invalidate,
    }),
  };
}

export function useSlots(params: { page?: number; experienceId?: string; status?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.slots(params),
    queryFn: () => api.get<Paginated<AvailabilitySlot>>('/guides/me/slots', params as never),
  });
}

export function useSlotMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['guide', 'slots'] });

  return {
    create: useMutation({
      mutationFn: (input: Record<string, unknown>) =>
        api.post<{ slot: AvailabilitySlot }>('/guides/me/slots', input),
      onSuccess: invalidate,
    }),
    bulk: useMutation({
      mutationFn: (input: Record<string, unknown>) =>
        api.post<{ created: number }>('/guides/me/slots/bulk', input),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) =>
        api.patch<{ slot: AvailabilitySlot }>(`/guides/me/slots/${id}`, patch),
      onSuccess: invalidate,
    }),
    cancel: useMutation({
      mutationFn: (id: string) => api.delete<{ cancelled: boolean }>(`/guides/me/slots/${id}`),
      onSuccess: invalidate,
    }),
  };
}

export function useGuideBookings(params: { page?: number; status?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.bookings(params),
    queryFn: () => api.get<Paginated<Booking>>('/guides/me/bookings', params as never),
  });
}

export function useGuideBooking(id: string) {
  return useQuery({
    queryKey: queryKeys.booking(id),
    queryFn: () => api.get<{ booking: Booking }>(`/guides/me/bookings/${id}`),
    enabled: Boolean(id),
  });
}

export function useBookingAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: string;
      action: 'CANCEL' | 'COMPLETE';
      reason: string;
    }) => api.post<{ booking: Booking }>(`/guides/me/bookings/${id}/action`, { action, reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['guide', 'bookings'] });
    },
  });
}

export function useGuideReviews(params: { page?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.reviews(params),
    queryFn: () => api.get<Paginated<Review>>('/guides/me/reviews', params as never),
  });
}

export function useGuideNotifications(params: { page?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.notifications(params),
    queryFn: () =>
      api.get<Paginated<Notification> & { unreadCount: number }>('/notifications', {
        ...params,
        unreadOnly: 'false',
      }),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => api.get<{ categories: Category[] }>('/categories'),
    staleTime: 10 * 60_000,
  });
}

// --- stories ---------------------------------------------------------------

export function useMyStories(params: { page?: number; status?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.stories(params),
    queryFn: () => api.get<Paginated<StoryCard>>('/guides/me/stories', params as never),
  });
}

export function useMyStory(id: string) {
  return useQuery({
    queryKey: queryKeys.story(id),
    queryFn: () => api.get<{ story: Story }>(`/guides/me/stories/${id}`),
    enabled: Boolean(id),
  });
}

/**
 * Create, edit, submit and delete. Every mutation invalidates the list, and
 * editing a published story sends it back to review — that happens server
 * side, so the UI just reflects whatever status comes back.
 */
export function useStoryMutations() {
  const client = useQueryClient();
  const invalidate = () => {
    void client.invalidateQueries({ queryKey: ['guide', 'stories'] });
  };

  return {
    create: useMutation({
      mutationFn: (input: StoryCreateInput) =>
        api.post<{ story: Story }>('/guides/me/stories', input),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, patch }: { id: string; patch: StoryUpdateInput }) =>
        api.patch<{ story: Story }>(`/guides/me/stories/${id}`, patch),
      onSuccess: invalidate,
    }),
    submit: useMutation({
      mutationFn: (id: string) => api.post<{ story: Story }>(`/guides/me/stories/${id}/submit`, {}),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => api.delete<void>(`/guides/me/stories/${id}`),
      onSuccess: invalidate,
    }),
  };
}
