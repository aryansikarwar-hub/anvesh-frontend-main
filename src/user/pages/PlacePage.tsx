'use client';

import { Link } from '@/user/router';
import { useParams } from '@/user/router';
import {
  BadgeIndianRupee,
  Calendar,
  Check,
  Eye,
  MapPin,
  MessageCircleHeart,
  Navigation,
  Plus,
  Signpost,
  Sparkles,
  Star,
} from 'lucide-react';
import { Badge, Button, Card, CardContent, LoadingState, Money, PageShell, PlaceCover, Section } from '@/ui';
import { usePlace } from '@/user/hooks/use-content';
import { useNearby, useSavePlace } from '@/user/hooks/use-discovery';
import { useCurrentUser } from '@/user/hooks/use-session';
import { QueryBoundary } from '@/user/components/query-boundary';
import { PlaceGrid } from '@/user/components/place-grid';
import { ReviewsPanel } from '@/user/components/reviews-panel';
import { PlaceMiniMap } from '@/user/components/place-mini-map';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function crowdCopy(level: number): { text: string; short: string } {
  if (level <= 0.25) return { text: 'Rarely crowded', short: 'Low crowd' };
  if (level <= 0.55) return { text: 'Quiet on weekdays', short: 'Moderate' };
  return { text: 'Gets busy', short: 'High crowd' };
}

/**
 * A single place, in Raahi's detail-page shape: a full-bleed hero, a
 * why-visit / practical-notes body with a sticky budget sidebar, and a
 * nearby-and-quieter rail at the end.
 *
 * The hero photo is the place's own first uploaded image when a guide has
 * added one — Anvesh never substitutes stock photography — and falls back
 * to the same deterministic slug-and-category cover the cards use.
 */
export default function PlacePage() {
  const { slug } = useParams() as { slug: string };
  const query = usePlace(slug);
  const { isAuthenticated } = useCurrentUser();
  const save = useSavePlace();

  return (
    <QueryBoundary
      isLoading={query.isLoading}
      isError={query.isError}
      error={query.error}
      data={query.data}
      onRetry={() => void query.refetch()}
      skeleton="rows"
    >
      {({ place }) => {
        const crowd = crowdCopy(place.signals.crowdLevel);
        const heroImage = place.images[0] ?? null;

        return (
          <div>
            {/* Hero */}
            <section className="relative flex h-[56vh] min-h-[420px] items-end overflow-hidden">
              <PlaceCover
                title={place.title}
                slug={place.slug}
                image={heroImage ? { url: heroImage.url, alt: heroImage.alt } : null}
                scrim={false}
                className="absolute inset-0 size-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/85 via-forest-deep/25 to-transparent" />
              <div className="relative mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
                <div className="animate-fade-up">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-deep/70 px-3 py-1.5 text-xs font-semibold text-cream backdrop-blur-md">
                      <Sparkles className="size-3" aria-hidden="true" />
                      {Math.round(place.discoveryScore * 100)}% match
                    </span>
                    {place.categorySlugs[0] ? (
                      <span className="rounded-full glass px-3 py-1.5 text-xs font-semibold text-cream">
                        {place.categorySlugs[0].replace(/-/g, ' ')}
                      </span>
                    ) : null}
                    <span className="rounded-full glass px-3 py-1.5 text-xs font-semibold text-cream">
                      Authenticity {Math.round(place.signals.authenticityScore * 100)}%
                    </span>
                    {place.ownership === 'LOCAL_OWNED' ? (
                      <span className="rounded-full glass px-3 py-1.5 text-xs font-semibold text-cream">
                        Locally owned
                      </span>
                    ) : null}
                  </div>
                  <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-cream md:text-6xl">
                    {place.title}
                  </h1>
                  <p className="mt-3 inline-flex items-center gap-1.5 text-cream/85">
                    <MapPin className="size-4" aria-hidden="true" />
                    {place.address.city}, {place.address.state}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {isAuthenticated ? (
                      <Button
                        onClick={() => save.mutate(place.id)}
                        loading={save.isPending}
                        className="h-11 rounded-full font-bold shadow-lift"
                        variant="onImage"
                      >
                        {save.isSuccess ? <Check className="size-4" /> : <Plus className="size-4" />}
                        Save this place
                      </Button>
                    ) : (
                      <Button asChild variant="onImage" className="h-11 rounded-full font-bold shadow-lift">
                        <Link href={`/login?next=%2Fplaces%2F${place.slug}`}>Sign in to save</Link>
                      </Button>
                    )}
                    <Button
                      asChild
                      variant="outline"
                      className="h-11 rounded-full border-cream/40 bg-cream/10 font-bold text-cream hover:bg-cream/20 hover:text-cream"
                    >
                      <Link href="/map">
                        <Navigation className="size-4" aria-hidden="true" />
                        Get directions
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="h-11 rounded-full border-cream/40 bg-cream/10 font-bold text-cream hover:bg-cream/20 hover:text-cream"
                    >
                      <Link href="/ai">
                        <MessageCircleHeart className="size-4" aria-hidden="true" />
                        Ask AI
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Body */}
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.6fr_1fr] lg:px-8">
              <div className="space-y-10">
                <section>
                  <h2 className="text-2xl font-extrabold tracking-tight">About this place</h2>
                  <p className="mt-4 whitespace-pre-line leading-relaxed text-foreground/85">
                    {place.description}
                  </p>
                </section>

                {place.images.length > 1 ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {place.images.slice(1, 7).map((image) => (
                      <img
                        key={image.key}
                        src={image.url}
                        alt={image.alt}
                        loading="lazy"
                        className="aspect-[4/3] w-full rounded-2xl object-cover"
                      />
                    ))}
                  </div>
                ) : null}

                {place.details.tips.length > 0 ? (
                  <section className="rounded-3xl border border-clay/25 bg-clay/5 p-6">
                    <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
                      <Eye className="size-5 text-clay" aria-hidden="true" />
                      What to know before visiting
                    </h2>
                    <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-foreground/85">
                      {place.details.tips.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <section className="grid gap-6 sm:grid-cols-2">
                  <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                    <h3 className="flex items-center gap-2 text-base font-bold tracking-tight">
                      <Calendar className="size-4.5 text-primary" aria-hidden="true" />
                      Best time to visit
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {place.details.bestTimeMonths.length
                        ? place.details.bestTimeMonths.map((m) => MONTHS[m - 1]).join(', ')
                        : 'Any time of year'}
                      . Crowds stay {crowd.short.toLowerCase()} — the ranking flags this as one of
                      the calmer windows.
                    </p>
                  </div>
                  <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                    <h3 className="flex items-center gap-2 text-base font-bold tracking-tight">
                      <Signpost className="size-4.5 text-primary" aria-hidden="true" />
                      Amenities
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {place.details.amenities.length ? place.details.amenities.join(', ') : 'Not listed yet.'}
                    </p>
                  </div>
                </section>

                <ReviewsPanel targetType="PLACE" targetId={place.id} targetTitle={place.title} />
              </div>

              {/* Sidebar */}
              <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <h3 className="flex items-center gap-2 text-base font-bold tracking-tight">
                    <BadgeIndianRupee className="size-4.5 text-primary" aria-hidden="true" />
                    Visit details
                  </h3>
                  <dl className="mt-4 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-dashed border-border pb-2.5 text-sm">
                      <dt className="text-muted-foreground">Entry</dt>
                      <dd className="font-bold">
                        {place.details.entryFeeMinor === 0 ? (
                          'Free entry'
                        ) : (
                          <Money minor={place.details.entryFeeMinor} />
                        )}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between border-b border-dashed border-border pb-2.5 text-sm">
                      <dt className="text-muted-foreground">Typical visit</dt>
                      <dd className="font-bold">
                        {place.details.durationMin ? `About ${Math.round(place.details.durationMin / 60)} hours` : '—'}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <dt className="text-muted-foreground">Ownership</dt>
                      <dd className="font-bold capitalize">{place.ownership.replace(/_/g, ' ').toLowerCase()}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex items-center justify-between rounded-2xl bg-secondary px-4 py-3 text-sm">
                    <span className="font-semibold text-secondary-foreground">Rating</span>
                    <span className="inline-flex items-center gap-1 font-extrabold">
                      {place.signals.ratingCount > 0 ? (
                        <>
                          <Star className="size-3.5 fill-gold text-gold" aria-hidden="true" />
                          {place.signals.ratingAvg.toFixed(1)}
                          <span className="font-normal text-muted-foreground">
                            ({place.signals.ratingCount})
                          </span>
                        </>
                      ) : (
                        'No reviews yet'
                      )}
                    </span>
                  </div>
                  <div className="mt-4">
                    <PlaceMiniMap
                      lng={place.location.coordinates[0]}
                      lat={place.location.coordinates[1]}
                      title={place.title}
                    />
                  </div>
                </div>

                {place.guideSummary ? (
                  <Card>
                    <CardContent className="flex flex-col gap-2 pt-5">
                      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Added by
                      </span>
                      <Link href={`/guides/${place.guideSummary.slug}`} className="text-lg font-bold hover:underline">
                        {place.guideSummary.displayName}
                      </Link>
                      {place.guideSummary.verified ? <Badge variant="success">Verified guide</Badge> : null}
                    </CardContent>
                  </Card>
                ) : null}
              </aside>
            </div>

            <PageShell>
              <NearbySection
                lng={place.location.coordinates[0]}
                lat={place.location.coordinates[1]}
                excludePlaceId={place.id}
              />
            </PageShell>
          </div>
        );
      }}
    </QueryBoundary>
  );
}

function NearbySection({ lng, lat, excludePlaceId }: { lng: number; lat: number; excludePlaceId: string }) {
  const nearby = useNearby({ lng, lat, radiusKm: 60, limit: 6, excludePlaceId });

  return (
    <Section title="Nearby and quieter" description="Within 60 km, ranked the same way." className="pb-16">
      {nearby.isLoading ? (
        <LoadingState rows={2} />
      ) : nearby.data && nearby.data.items.length > 0 ? (
        <PlaceGrid places={nearby.data.items} />
      ) : (
        <p className="text-sm text-muted-foreground">Nothing else is published within 60 km yet.</p>
      )}
    </Section>
  );
}