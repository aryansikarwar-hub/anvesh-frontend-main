import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type Category,
  type Destination,
  type Paginated,
  type PlaceCard,
  type SavedPlace,
} from '@/lib/types';
import { api } from '@/user/lib/api';
import { queryKeys } from '@/user/lib/query-keys';

export interface SearchParams {
  q?: string;
  categories?: string;
  city?: string;
  state?: string;
  destinationId?: string;
  lng?: number;
  lat?: number;
  radiusKm?: number;
  ownership?: string;
  maxCrowd?: number;
  minRating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export function useSearch(params: SearchParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.search(params as never),
    queryFn: () => api.get<Paginated<PlaceCard>>('/discovery/search', params as never),
    enabled,
  });
}

export function useFeed(params: { limit?: number; lng?: number; lat?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.feed(params),
    queryFn: () => api.get<{ items: PlaceCard[] }>('/discovery/feed', params),
  });
}

export function useHiddenGems(params: { limit?: number; state?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.hiddenGems(params),
    queryFn: () => api.get<{ items: PlaceCard[] }>('/discovery/hidden-gems', params),
  });
}

export function useNearby(params: {
  lng: number;
  lat: number;
  radiusKm?: number;
  limit?: number;
  excludePlaceId?: string;
}) {
  return useQuery({
    queryKey: queryKeys.nearby(params),
    queryFn: () => api.get<{ items: PlaceCard[] }>('/discovery/nearby', params),
    enabled: Number.isFinite(params.lng) && Number.isFinite(params.lat),
  });
}

export function useMapPlaces(
  bounds: { west: number; south: number; east: number; north: number } | null,
  filters: { categories?: string; maxCrowd?: number } = {},
) {
  return useQuery({
    queryKey: queryKeys.map({ ...bounds, ...filters }),
    queryFn: () =>
      api.get<{ items: PlaceCard[] }>('/discovery/map', { ...bounds, ...filters } as never),
    enabled: bounds !== null,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => api.get<{ categories: Category[] }>('/categories'),
    staleTime: 10 * 60_000,
  });
}

export function useDestinations() {
  return useQuery({
    queryKey: queryKeys.destinations,
    queryFn: () => api.get<{ destinations: Destination[] }>('/destinations'),
    staleTime: 10 * 60_000,
  });
}

export function useSavePlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (placeId: string) =>
      api.post<{ saved: SavedPlace }>('/users/me/saved', { placeId, collectionId: null }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['saved'] });
    },
  });
}

export function useUnsavePlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (placeId: string) => api.delete<void>(`/users/me/saved/${placeId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['saved'] });
    },
  });
}
