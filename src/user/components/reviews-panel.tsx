'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Badge, Button, Card, CardContent, Field, LoadingState, Textarea, Input } from '@/ui';
import { useReviews } from '@/user/hooks/use-content';
import { useCreateReview } from '@/user/hooks/use-commerce';
import { useCurrentUser } from '@/user/hooks/use-session';
import { describeError } from '@/user/lib/api';

export function ReviewsPanel({
  targetType,
  targetId,
  targetTitle,
}: {
  targetType: 'PLACE' | 'EXPERIENCE';
  targetId: string;
  targetTitle: string;
}) {
  const [page, setPage] = useState(1);
  const reviews = useReviews({ targetType, targetId, page });
  const { isAuthenticated } = useCurrentUser();
  const create = useCreateReview();
  const [form, setForm] = useState({ rating: 5, title: '', body: '', crowdFelt: 0.3 });

  return (
    <section className="flex flex-col gap-4" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="text-xl">
        Reviews
      </h2>

      {isAuthenticated ? (
        <Card>
          <CardContent className="flex flex-col gap-3 pt-5">
            <form
              className="flex flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                create.mutate(
                  { targetType, targetId, ...form },
                  { onSuccess: () => setForm({ rating: 5, title: '', body: '', crowdFelt: 0.3 }) },
                );
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Rating" htmlFor="review-rating">
                  <select
                    id="review-rating"
                    value={form.rating}
                    onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })}
                    className="h-10 w-full rounded-[var(--radius-control)] border border-line-strong bg-paper-raised px-3 text-sm"
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {value} star{value === 1 ? '' : 's'}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field
                  label="How crowded did it feel?"
                  htmlFor="review-crowd"
                  hint="This feeds the crowd signal, which lowers a place's ranking."
                >
                  <select
                    id="review-crowd"
                    value={form.crowdFelt}
                    onChange={(event) => setForm({ ...form, crowdFelt: Number(event.target.value) })}
                    className="h-10 w-full rounded-[var(--radius-control)] border border-line-strong bg-paper-raised px-3 text-sm"
                  >
                    <option value={0.1}>Almost nobody there</option>
                    <option value={0.3}>Comfortably quiet</option>
                    <option value={0.6}>Steady stream of people</option>
                    <option value={0.9}>Packed</option>
                  </select>
                </Field>
              </div>

              <Field label="Title" htmlFor="review-title" required>
                <Input
                  id="review-title"
                  value={form.title}
                  minLength={3}
                  maxLength={120}
                  required
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder={`What stood out about ${targetTitle}?`}
                />
              </Field>

              <Field label="Your review" htmlFor="review-body" required hint="At least 20 characters.">
                <Textarea
                  id="review-body"
                  value={form.body}
                  minLength={20}
                  maxLength={4000}
                  required
                  onChange={(event) => setForm({ ...form, body: event.target.value })}
                  placeholder="What was it actually like? When did you go, and what would you tell a friend?"
                />
              </Field>

              {create.isError ? (
                <p role="alert" className="text-sm text-danger-500">
                  {describeError(create.error).description}
                </p>
              ) : null}

              <div>
                <Button type="submit" loading={create.isPending}>
                  Post review
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {reviews.isLoading ? (
        <LoadingState rows={2} />
      ) : reviews.data && reviews.data.items.length > 0 ? (
        <div className="flex flex-col gap-3">
          {reviews.data.items.map((review) => (
            <Card key={review.id}>
              <CardContent className="flex flex-col gap-2 pt-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold">
                    <Star className="size-4 fill-gold-500 text-gold-500" aria-hidden="true" />
                    {review.rating}
                  </span>
                  <span className="font-medium">{review.title}</span>
                  {review.crowdFelt !== null && review.crowdFelt <= 0.3 ? (
                    <Badge variant="quiet">Felt quiet</Badge>
                  ) : null}
                </div>
                <p className="text-sm leading-relaxed text-ink-soft">{review.body}</p>
                <p className="text-xs text-ink-faint">
                  {review.authorName} · {new Date(review.createdAt).toLocaleDateString('en-IN')}
                </p>
              </CardContent>
            </Card>
          ))}
          {reviews.data.pageInfo.hasNext ? (
            <Button variant="ghost" onClick={() => setPage((value) => value + 1)}>
              Load more reviews
            </Button>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-ink-muted">
          No reviews yet. {isAuthenticated ? 'Be the first to write one.' : 'Sign in to write one.'}
        </p>
      )}
    </section>
  );
}