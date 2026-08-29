'use client';

import { useState } from 'react';
import { useParams } from '@/user/router';
import { Link } from '@/user/router';
import { useRouter } from '@/user/router';
import { Clock, MapPin, Users } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Field,
  LoadingState,
  Money,
  PageShell,
} from '@/ui';
import { useAvailability, useExperience } from '@/user/hooks/use-content';
import { useCreateBooking } from '@/user/hooks/use-commerce';
import { useCurrentUser } from '@/user/hooks/use-session';
import { QueryBoundary } from '@/user/components/query-boundary';
import { ReviewsPanel } from '@/user/components/reviews-panel';
import { describeError } from '@/user/lib/api';

export default function ExperiencePage() {
  const { slug } = useParams() as { slug: string };
  const query = useExperience(slug);

  return (
    <PageShell className="py-8">
      <QueryBoundary
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        data={query.data}
        onRetry={() => void query.refetch()}
        skeleton="rows"
      >
        {({ experience }) => (
          <article className="flex flex-col gap-8">
            <header className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {experience.categorySlugs.map((category) => (
                  <Badge key={category}>{category.replace(/-/g, ' ')}</Badge>
                ))}
                {experience.guideSummary.verified ? (
                  <Badge variant="success">Verified guide</Badge>
                ) : null}
              </div>
              <h1 className="text-3xl sm:text-4xl">{experience.title}</h1>
              <p className="max-w-3xl text-lg text-ink-soft">{experience.summary}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" aria-hidden="true" />
                  {Math.round(experience.durationMin / 60)} hours
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-4" aria-hidden="true" />
                  Up to {experience.maxSeats} people
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" aria-hidden="true" />
                  {experience.meetingPoint.address.city}, {experience.meetingPoint.address.state}
                </span>
                <span>
                  Run by{' '}
                  <Link
                    href={`/guides/${experience.guideSummary.slug}`}
                    className="text-laterite-600 underline"
                  >
                    {experience.guideSummary.displayName}
                  </Link>
                </span>
              </div>
            </header>

            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
              <div className="flex flex-col gap-8">
                <section className="flex flex-col gap-3">
                  <h2 className="text-xl">What happens</h2>
                  <p className="whitespace-pre-line leading-relaxed text-ink-soft">
                    {experience.description}
                  </p>
                </section>

                <div className="grid gap-6 sm:grid-cols-2">
                  <section>
                    <h3 className="pb-2 text-base font-semibold">Included</h3>
                    <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-ink-soft">
                      {experience.inclusions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                      {experience.inclusions.length === 0 ? <li>Nothing listed</li> : null}
                    </ul>
                  </section>
                  <section>
                    <h3 className="pb-2 text-base font-semibold">Not included</h3>
                    <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-ink-soft">
                      {experience.exclusions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                      {experience.exclusions.length === 0 ? <li>Nothing listed</li> : null}
                    </ul>
                  </section>
                </div>

                <section className="rounded-[var(--radius-card)] border border-line bg-paper-sunk/50 p-4">
                  <h3 className="text-base font-semibold">Meeting point</h3>
                  <p className="pt-1 text-sm text-ink-soft">{experience.meetingPoint.label}</p>
                  <p className="pt-1 font-mono text-xs text-ink-faint">
                    {experience.meetingPoint.location.coordinates[1].toFixed(5)},{' '}
                    {experience.meetingPoint.location.coordinates[0].toFixed(5)}
                  </p>
                  <p className="pt-2 text-xs text-ink-muted">
                    Cancellation policy: {experience.cancellationPolicy.toLowerCase()}
                  </p>
                </section>

                <ReviewsPanel
                  targetType="EXPERIENCE"
                  targetId={experience.id}
                  targetTitle={experience.title}
                />
              </div>

              <BookingPanel
                experienceId={experience.id}
                basePriceMinor={experience.basePriceMinor}
                maxSeats={experience.maxSeats}
              />
            </div>
          </article>
        )}
      </QueryBoundary>
    </PageShell>
  );
}

function BookingPanel({
  experienceId,
  basePriceMinor,
  maxSeats,
}: {
  experienceId: string;
  basePriceMinor: number;
  maxSeats: number;
}) {
  const router = useRouter();
  const { isAuthenticated } = useCurrentUser();
  const availability = useAvailability(experienceId);
  const createBooking = useCreateBooking();
  const [slotId, setSlotId] = useState('');
  const [seats, setSeats] = useState(1);

  const slots = availability.data?.slots ?? [];
  const selected = slots.find((slot) => slot.id === slotId);

  return (
    <aside className="lg:sticky lg:top-24 lg:h-fit">
      <Card>
        <CardContent className="flex flex-col gap-4 pt-5">
          <div>
            <span className="text-sm text-ink-muted">From</span>
            <div className="font-display text-2xl">
              <Money minor={basePriceMinor} suffix="per person" />
            </div>
          </div>

          {availability.isLoading ? (
            <LoadingState rows={2} label="Loading dates" />
          ) : slots.length === 0 ? (
            <p className="rounded-[var(--radius-control)] bg-paper-sunk p-3 text-sm text-ink-muted">
              No dates are open right now. The guide publishes availability from their portal.
            </p>
          ) : (
            <>
              <Field label="Date" htmlFor="booking-slot" required>
                <select
                  id="booking-slot"
                  value={slotId}
                  onChange={(event) => setSlotId(event.target.value)}
                  className="h-10 w-full rounded-[var(--radius-control)] border border-line-strong bg-paper-raised px-3 text-sm"
                >
                  <option value="">Choose a date</option>
                  {slots.map((slot) => (
                    <option key={slot.id} value={slot.id} disabled={slot.seatsAvailable === 0}>
                      {new Date(slot.startAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                      {slot.seatsAvailable === 0
                        ? ' — sold out'
                        : ` — ${slot.seatsAvailable} seat${slot.seatsAvailable === 1 ? '' : 's'} left`}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Travellers" htmlFor="booking-seats">
                <select
                  id="booking-seats"
                  value={seats}
                  onChange={(event) => setSeats(Number(event.target.value))}
                  className="h-10 w-full rounded-[var(--radius-control)] border border-line-strong bg-paper-raised px-3 text-sm"
                >
                  {Array.from(
                    { length: Math.min(selected?.seatsAvailable ?? maxSeats, 20) },
                    (_, index) => index + 1,
                  ).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </Field>

              {selected ? (
                <dl className="flex flex-col gap-1 border-t border-line pt-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink-muted">
                      {seats} x <Money minor={selected.priceMinor} />
                    </dt>
                    <dd>
                      <Money minor={selected.priceMinor * seats} />
                    </dd>
                  </div>
                  <p className="pt-1 text-xs text-ink-faint">
                    Taxes on the platform fee are added at checkout. The exact total is computed by
                    the server, never in the browser.
                  </p>
                </dl>
              ) : null}

              {createBooking.isError ? (
                <p role="alert" className="text-sm text-danger-500">
                  {describeError(createBooking.error).description}
                </p>
              ) : null}

              {isAuthenticated ? (
                <Button
                  disabled={!slotId}
                  loading={createBooking.isPending}
                  onClick={() =>
                    createBooking.mutate(
                      { slotId, seats },
                      { onSuccess: ({ booking }) => router.push(`/checkout/${booking.id}`) },
                    )
                  }
                >
                  Hold these seats
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/login">Sign in to book</Link>
                </Button>
              )}
              <p className="text-xs text-ink-faint">
                Seats are held while you pay and released automatically if payment is not completed.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}