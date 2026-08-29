import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type Booking,
  type CheckoutIntent,
  type Paginated,
  type Payment,
  type Review,
} from '@/lib/types';
import { api } from '@/user/lib/api';
import { queryKeys } from '@/user/lib/query-keys';

export function useBookings(params: { page?: number; status?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.bookings(params),
    queryFn: () => api.get<Paginated<Booking>>('/bookings', params as never),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: queryKeys.booking(id),
    queryFn: () => api.get<{ booking: Booking }>(`/bookings/${id}`),
    enabled: Boolean(id),
  });
}

/**
 * Creating a booking is the one call that carries an idempotency key: a double
 * click, a retry or a flaky network must never take two sets of seats.
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { slotId: string; seats: number; travellerNote?: string }) =>
      api.post<{ booking: Booking }>(
        '/bookings',
        { ...input, travellerNote: input.travellerNote ?? '' },
        { idempotencyKey: crypto.randomUUID() },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      void queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post<{ booking: Booking }>(`/bookings/${id}/cancel`, { reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (bookingId: string) =>
      api.post<{ checkout: CheckoutIntent }>('/payments/order', { bookingId }),
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      bookingId: string;
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }) => api.post<{ payment: Payment }>('/payments/verify', input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function usePaymentByBooking(bookingId: string) {
  return useQuery({
    queryKey: queryKeys.payment(bookingId),
    queryFn: () => api.get<{ payment: Payment }>(`/payments/by-booking/${bookingId}`),
    enabled: Boolean(bookingId),
    retry: false,
  });
}

export function useMyReviews(page = 1) {
  return useQuery({
    queryKey: queryKeys.myReviews(page),
    queryFn: () => api.get<Paginated<Review>>('/reviews/mine', { page }),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      targetType: 'PLACE' | 'EXPERIENCE';
      targetId: string;
      rating: number;
      title: string;
      body: string;
      crowdFelt: number | null;
    }) => api.post<{ review: Review }>('/reviews', { ...input, visitedAt: null, imageUrls: [] }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/reviews/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}
