import { useMutation, useQuery } from '@tanstack/react-query';
import {
  type AiDiscoveryResult,
  type AiItineraryResult,
  type AiProviderInfo,
  type Trip,
} from '@/lib/types';
import { api } from '@/user/lib/api';
import { queryKeys } from '@/user/lib/query-keys';

export function useAiStatus() {
  return useQuery({
    queryKey: queryKeys.aiStatus,
    queryFn: () => api.get<{ provider: AiProviderInfo }>('/ai/status'),
    staleTime: 5 * 60_000,
  });
}

export function useAiDiscover() {
  return useMutation({
    mutationFn: (input: { prompt: string; lng?: number; lat?: number }) =>
      api.post<{ result: AiDiscoveryResult }>('/ai/discover', {
        ...input,
        radiusKm: 150,
        limit: 6,
      }),
  });
}

export function useAiItinerary() {
  return useMutation({
    mutationFn: (input: {
      city?: string;
      destinationId: string | null;
      days: number;
      travellers: number;
      interests: string[];
      pace: 'RELAXED' | 'BALANCED' | 'PACKED';
      avoidCrowds: boolean;
      saveAsTrip: boolean;
    }) => api.post<{ itinerary: AiItineraryResult; trip: Trip | null }>('/ai/itinerary', input),
  });
}
