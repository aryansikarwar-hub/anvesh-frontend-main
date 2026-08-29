import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type AuditLogEntry,
  type Booking,
  type ContentReport,
  type ContentStatus,
  type Experience,
  type GuideProfile,
  type Paginated,
  type Payment,
  type Place,
  type PublicUser,
  type RankingParams,
  type RankingWeights,
  type Review,
  type StoryCard,
} from '@/lib/types';
import { api } from '@/admin/lib/api';
import { queryKeys } from '@/admin/lib/query-keys';

export interface AdminDashboard {
  users: { total: number; travellers: number; guides: number; newLast30Days: number };
  content: { places: number; published: number; pendingReview: number; experiences: number };
  commerce: {
    bookingsLast30Days: number;
    confirmedLast30Days: number;
    grossMinorLast30Days: number;
    commissionMinorLast30Days: number;
    currency: 'INR';
  };
  moderation: { placesPending: number; reviewsReported: number };
  ai: { requestsLast30Days: number; rejectedLast30Days: number };
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => api.get<{ dashboard: AdminDashboard }>('/admin/dashboard'),
  });
}

export function useAdminAnalytics(params: { granularity?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.analytics(params),
    queryFn: () =>
      api.get<{
        granularity: string;
        bookings: { bucket: string; count: number; grossMinor: number }[];
        events: { bucket: string; type: string; count: number }[];
      }>('/admin/analytics', params as never),
  });
}

export interface AiMonitoring {
  byVerdict: { verdict: string; count: number; avgLatencyMs: number }[];
  recentRejections: {
    id: string;
    task: string;
    provider: string;
    model: string;
    verdict: string;
    detail: string | null;
    requestId: string;
    createdAt: string;
  }[];
}

export function useAiMonitoring() {
  return useQuery({
    queryKey: queryKeys.aiMonitoring,
    queryFn: () => api.get<AiMonitoring>('/admin/ai/monitoring'),
  });
}

export interface SystemHealth {
  mongo: string;
  mongoReplicaSet: string;
  redis: string;
  pendingPaymentOrders: number;
  expiredHoldsAwaitingSweep: number;
  uptimeSeconds: number;
  nodeVersion: string;
}

export function useSystemHealth() {
  return useQuery({
    queryKey: queryKeys.systemHealth,
    queryFn: () => api.get<{ system: SystemHealth }>('/admin/system/health'),
    refetchInterval: 30_000,
  });
}

export function useAdminUsers(params: { page?: number; q?: string; role?: string; status?: string }) {
  return useQuery({
    queryKey: queryKeys.users(params),
    queryFn: () => api.get<Paginated<PublicUser>>('/admin/users', params as never),
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => api.get<{ user: PublicUser }>(`/admin/users/${id}`),
    enabled: Boolean(id),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) =>
      api.patch<{ user: PublicUser }>(`/admin/users/${id}`, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useAdminGuides(params: { page?: number; q?: string; verified?: string }) {
  return useQuery({
    queryKey: queryKeys.guides(params),
    queryFn: () => api.get<Paginated<GuideProfile>>('/admin/guides', params as never),
  });
}

export function useVerifyGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, verified, note }: { id: string; verified: boolean; note: string }) =>
      api.post<{ guide: GuideProfile }>(`/admin/guides/${id}/verify`, { verified, note }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'guides'] });
    },
  });
}

export function useAdminPlaces(params: { page?: number; status?: string }) {
  return useQuery({
    queryKey: queryKeys.places(params),
    queryFn: () => api.get<Paginated<Place>>('/admin/places', params as never),
  });
}

export function useModeratePlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: ContentStatus; reason: string }) =>
      api.post<{ place: Place }>(`/admin/places/${id}/moderate`, { status, reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'places'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useAdminExperiences(params: { page?: number; status?: string }) {
  return useQuery({
    queryKey: queryKeys.experiences(params),
    queryFn: () => api.get<Paginated<Experience>>('/admin/experiences', params as never),
  });
}

export function useModerateExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: ContentStatus; reason: string }) =>
      api.post<{ experience: Experience }>(`/admin/experiences/${id}/moderate`, { status, reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'experiences'] });
    },
  });
}

export function useAdminReviews(params: { page?: number; reportedOnly?: string }) {
  return useQuery({
    queryKey: queryKeys.reviews(params),
    queryFn: () => api.get<Paginated<Review>>('/admin/reviews', params as never),
  });
}

export function useModerateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      note,
    }: {
      id: string;
      status: 'PUBLISHED' | 'HIDDEN' | 'REMOVED';
      note: string;
    }) => api.post<{ review: Review }>(`/admin/reviews/${id}/moderate`, { status, note }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
  });
}

export function useAdminReports(params: { page?: number; status?: string }) {
  return useQuery({
    queryKey: queryKeys.reports(params),
    queryFn: () => api.get<Paginated<ContentReport>>('/admin/reports', params as never),
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      resolutionNote,
    }: {
      id: string;
      status: string;
      resolutionNote: string;
    }) => api.post<{ report: unknown }>(`/admin/reports/${id}/resolve`, { status, resolutionNote }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    },
  });
}

export function useAdminBookings(params: { page?: number; status?: string }) {
  return useQuery({
    queryKey: queryKeys.bookings(params),
    queryFn: () => api.get<Paginated<Booking>>('/admin/bookings', params as never),
  });
}

export function useAdminPayments(params: { page?: number; status?: string }) {
  return useQuery({
    queryKey: queryKeys.payments(params),
    queryFn: () => api.get<Paginated<Payment>>('/admin/payments', params as never),
  });
}

export function useRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { bookingId: string; amountMinor?: number; reason: string }) =>
      api.post<{ payment: Payment }>('/admin/refunds', input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    },
  });
}

export function useAuditLogs(params: { page?: number; action?: string }) {
  return useQuery({
    queryKey: queryKeys.audit(params),
    queryFn: () => api.get<Paginated<AuditLogEntry>>('/admin/audit-logs', params as never),
  });
}

export interface RankingConfig {
  id: string;
  name: string;
  version: number;
  weights: RankingWeights;
  params: RankingParams;
}

export function useRecommendationConfig() {
  return useQuery({
    queryKey: queryKeys.recommendationConfig,
    queryFn: () =>
      api.get<{ active: RankingConfig; history: RankingConfig[] }>('/admin/recommendation-config'),
  });
}

export function useUpdateRecommendationConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { weights?: RankingWeights; params?: RankingParams; name?: string }) =>
      api.put<{ config: RankingConfig }>('/admin/recommendation-config', input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.recommendationConfig });
    },
  });
}

// --- stories ---------------------------------------------------------------

export function useAdminStories(params: { page?: number; status?: string }) {
  return useQuery({
    queryKey: queryKeys.stories(params),
    queryFn: () => api.get<Paginated<StoryCard>>('/admin/stories', params as never),
  });
}

export function useModerateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: ContentStatus; reason: string }) =>
      api.post<{ story: StoryCard }>(`/admin/stories/${id}/moderate`, { status, reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'stories'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
