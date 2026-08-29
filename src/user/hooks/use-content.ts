import { useQuery } from '@tanstack/react-query';
import {
  type AvailabilitySlot,
  type Destination,
  type Experience,
  type GuideProfile,
  type Paginated,
  type Place,
  type Review,
} from '@/lib/types';
import { api } from '@/user/lib/api';
import { queryKeys } from '@/user/lib/query-keys';

export function usePlace(slug: string) {
  return useQuery({
    queryKey: queryKeys.place(slug),
    queryFn: () => api.get<{ place: Place }>(`/places/${slug}`),
    enabled: Boolean(slug),
  });
}

export function useExperience(slug: string) {
  return useQuery({
    queryKey: queryKeys.experience(slug),
    queryFn: () => api.get<{ experience: Experience }>(`/experiences/${slug}`),
    enabled: Boolean(slug),
  });
}

export function useExperienceList(params: { guideSlug?: string; placeId?: string; page?: number }) {
  return useQuery({
    queryKey: queryKeys.experiences(params),
    queryFn: () => api.get<Paginated<Experience>>('/experiences', params as never),
  });
}

export function useAvailability(experienceId: string) {
  return useQuery({
    queryKey: queryKeys.availability(experienceId),
    queryFn: () => api.get<{ slots: AvailabilitySlot[] }>(`/experiences/${experienceId}/availability`),
    enabled: Boolean(experienceId),
  });
}

export function useGuide(slug: string) {
  return useQuery({
    queryKey: queryKeys.guide(slug),
    queryFn: () => api.get<{ guide: GuideProfile }>(`/guides/${slug}`),
    enabled: Boolean(slug),
  });
}

export function useDestination(slug: string) {
  return useQuery({
    queryKey: queryKeys.destination(slug),
    queryFn: () => api.get<{ destination: Destination }>(`/destinations/${slug}`),
    enabled: Boolean(slug),
  });
}

export function useReviews(params: {
  targetType: 'PLACE' | 'EXPERIENCE';
  targetId: string;
  page?: number;
  sort?: string;
}) {
  return useQuery({
    queryKey: queryKeys.reviews(params),
    queryFn: () => api.get<Paginated<Review>>('/reviews', params as never),
    enabled: Boolean(params.targetId),
  });
}
