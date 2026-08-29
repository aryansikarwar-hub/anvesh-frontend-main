import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type Notification,
  type Paginated,
  type PublicUser,
  type SavedPlace,
  type Trip,
  type UserCollection,
} from '@/lib/types';
import { api } from '@/user/lib/api';
import { queryKeys } from '@/user/lib/query-keys';
import { useSessionStore } from '@/user/lib/session-store';

export function useSavedPlaces(params: { page?: number; collectionId?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.saved(params),
    queryFn: () => api.get<Paginated<SavedPlace>>('/users/me/saved', params as never),
  });
}

export function useCollections() {
  return useQuery({
    queryKey: queryKeys.collections,
    queryFn: () => api.get<{ collections: UserCollection[] }>('/users/me/collections'),
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; description: string; isPublic: boolean }) =>
      api.post<{ collection: UserCollection }>('/users/me/collections', input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.collections });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/users/me/collections/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.collections });
    },
  });
}

export function useTrips(params: { page?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.trips(params),
    queryFn: () => api.get<Paginated<Trip>>('/trips', params as never),
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: queryKeys.trip(id),
    queryFn: () => api.get<{ trip: Trip }>(`/trips/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; destinationId: string | null; travellers: number }) =>
      api.post<{ trip: Trip }>('/trips', {
        ...input,
        startDate: null,
        endDate: null,
        notes: '',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/trips/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useTripMutations(tripId: string) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.trip(tripId) });

  return {
    addDay: useMutation({
      mutationFn: (title: string) =>
        api.post<{ trip: Trip }>(`/trips/${tripId}/days`, { title, date: null }),
      onSuccess: invalidate,
    }),
    removeDay: useMutation({
      mutationFn: (dayId: string) => api.delete<{ trip: Trip }>(`/trips/${tripId}/days/${dayId}`),
      onSuccess: invalidate,
    }),
    addActivity: useMutation({
      mutationFn: ({ dayId, placeId, title }: { dayId: string; placeId: string; title: string }) =>
        api.post<{ trip: Trip }>(`/trips/${tripId}/days/${dayId}/activities`, {
          kind: 'PLACE',
          placeId,
          title,
          note: '',
          startTimeMin: null,
          durationMin: 120,
        }),
      onSuccess: invalidate,
    }),
    removeActivity: useMutation({
      mutationFn: ({ dayId, activityId }: { dayId: string; activityId: string }) =>
        api.delete<{ trip: Trip }>(`/trips/${tripId}/days/${dayId}/activities/${activityId}`),
      onSuccess: invalidate,
    }),
    reorder: useMutation({
      mutationFn: ({ dayId, activityIds }: { dayId: string; activityIds: string[] }) =>
        api.put<{ trip: Trip }>(`/trips/${tripId}/days/${dayId}/order`, { activityIds }),
      onSuccess: invalidate,
    }),
  };
}

export function useNotifications(params: { page?: number; unreadOnly?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.notifications(params),
    queryFn: () =>
      api.get<Paginated<Notification> & { unreadCount: number }>('/notifications', {
        ...params,
        unreadOnly: params.unreadOnly ? 'true' : 'false',
      }),
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ marked: number }>('/notifications/read-all', {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useUpdateProfile() {
  const setUser = useSessionStore((s) => s.setUser);
  return useMutation({
    mutationFn: (patch: Record<string, unknown>) =>
      api.patch<{ user: PublicUser }>('/users/me', patch),
    onSuccess: ({ user }) => setUser(user),
  });
}

export function useUpdatePreferences() {
  const setUser = useSessionStore((s) => s.setUser);
  return useMutation({
    mutationFn: (patch: Record<string, unknown>) =>
      api.patch<{ user: PublicUser }>('/users/me/preferences', patch),
    onSuccess: ({ user }) => setUser(user),
  });
}
