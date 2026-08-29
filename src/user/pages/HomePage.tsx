'use client';

import { Link } from '@/user/router';
import {
  ArrowRight,
  Compass,
  HeartHandshake,
  IndianRupee,
  MapPin,
  MessageCircleHeart,
  Mountain,
  Navigation,
  Search,
  Sparkles,
  Store,
  Timer,
  Users,
  Wand2,
} from 'lucide-react';
import { Button, TAGLINE } from '@/ui';
import { useCurrentUser } from '@/user/hooks/use-session';
import { useFeed, useHiddenGems } from '@/user/hooks/use-discovery';
import { useStories } from '@/user/hooks/use-stories';
import { PlaceGrid } from '@/user/components/place-grid';
import { StoryCard as UiStoryCard } from '@/ui';
import { QueryBoundary } from '@/user/components/query-boundary';

/** The signals the ranking actually reads, shown as chips under the fold line. */
const SIGNALS = [
  { icon: HeartHandshake, label: 'Interests' },
  { icon: IndianRupee, label: 'Budget' },
  { icon: Timer, label: 'Available time' },
  { icon: Compass, label: 'Travel style' },
  { icon: Navigation, label: 'Distance' },
  { icon: Users, label: 'Crowd level' },
  { icon: Mountain, label: 'Local authenticity' },
];

const HERO_FILTERS = ['Hidden Gems', 'Local Food', 'Nature', 'Adventure', 'Culture', 'Artisans'];

/**
 * The landing page, in Raahi's editorial layout: a full-bleed hero, a stats
 * strip, a "ranked for you" grid, an AI planner teaser, an AI assistant
 * teaser, a stories rail and a closing CTA.
 *
 * Anvesh has no stock photography and invents none — where Raahi lays a
 * photograph under the hero, this uses the same gradient band the rest of
 * the product uses for a full-bleed section. Every grid below it is real API
 * data, not the sample content Raahi ships with.
 */
export default function HomePage() {
  const { isAuthenticated } = useCurrentUser();
  const feed = useFeed({ limit: 3 });
  const gems = useHiddenGems({ limit: 6 });
  const stories = useStories({ limit: 3 });

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="relative flex min-h-[86svh] items-center overflow-hidden bg-forest-deep">
        <img
          src="/images/hero.jpg"
          alt="Misty temple hill at sunrise above a green valley"
          width={1920}
          height={1080}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/85 via-forest-deep/40 to-forest-deep/10" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8">
          <div className="max-w-2xl animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-semibold text-cream">
              <Sparkles className="size-3.5" aria-hidden="true" />
              AI-powered recommendations
            </span>

            <h1 className="mt-6 text-5xl font-extrabold leading-[1.04] tracking-tight text-cream md:text-7xl">
              Travel beyond the tourist map.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/85">
              {TAGLINE} Anvesh ranks quiet, locally owned places above famous ones — and tells you
              why each one is in front of <span className="font-semibold text-cream">you</span>.
            </p>

            <form
              action="/search"
              className="mt-8 flex items-center gap-2 rounded-3xl glass p-2 shadow-lift"
            >
              <div className="flex flex-1 items-center gap-2.5 px-3">
                <Search className="size-4.5 shrink-0 text-cream/70" aria-hidden="true" />
                <input
                  name="q"
                  placeholder="Where do you want to explore? Waterfalls near Ujire…"
                  className="w-full bg-transparent py-3 text-sm text-cream outline-none placeholder:text-cream/60"
                />
              </div>
              <Button type="submit" className="h-11 rounded-2xl px-5 font-bold shadow-soft">
                Discover
              </Button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {HERO_FILTERS.map((f) => (
                <Link
                  key={f}
                  href={`/explore?categories=${encodeURIComponent(f.toLowerCase().replace(/\s+/g, '-'))}`}
                  className="rounded-full border border-cream/25 px-3.5 py-1.5 text-xs font-medium text-cream/85 backdrop-blur-sm transition-all hover:border-cream/60 hover:text-cream"
                >
                  {f}
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-12 rounded-full px-6 text-base font-bold shadow-lift">
                <Link href="/planner">
                  <Wand2 className="size-5" aria-hidden="true" />
                  Plan my trip with AI
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-cream/40 bg-cream/10 px-6 text-base font-bold text-cream backdrop-blur-sm hover:bg-cream/20 hover:text-cream"
              >
                <Link href="/explore">
                  Explore Hidden Gems
                  <ArrowRight className="size-4.5" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            {!isAuthenticated ? (
              <p className="mt-5 text-sm text-cream/70">
                <Link href="/register" className="font-semibold text-cream underline underline-offset-4">
                  Create an account
                </Link>{' '}
                to save places, plan trips and book experiences.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-border bg-card/60">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            ['No popularity sort', 'the API will not accept one'],
            ['Local first', 'every listing says who owns it'],
            ['Grounded AI', 'every place named is checked against the database'],
          ].map(([num, label]) => (
            <div key={label} className="flex flex-col items-center gap-1 text-center sm:flex-row sm:justify-center sm:gap-2.5">
              <span className="text-lg font-extrabold tracking-tight text-primary sm:text-xl">{num}</span>
              <span className="text-sm text-muted-foreground">— {label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ============ PERSONALIZED DISCOVERY ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Personalized discovery"
            title="Not the most popular. The most relevant."
            description="Every recommendation is ranked against who you are — never against how many people have already been there."
          />
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/explore">
              See all hidden gems
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {SIGNALS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
            >
              <Icon className="size-3.5 text-primary" aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>

        <div className="mt-10">
          <QueryBoundary
            isLoading={feed.isLoading}
            isError={feed.isError}
            error={feed.error}
            data={feed.data}
            isEmpty={(data) => data.items.length === 0}
            onRetry={() => void feed.refetch()}
            emptyTitle="No places published yet"
            emptyDescription="Once guides publish places, they'll be ranked here for you."
          >
            {(data) => <PlaceGrid places={data.items} />}
          </QueryBoundary>
        </div>
      </section>

      {/* ============ HIDDEN GEMS ============ */}
      <section className="bg-forest-mist/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Under the radar"
            title="Low visitor numbers, high quality."
            description="These lose their place here the moment they get busier — popularity is a penalty, not a boost."
          />
          <div className="mt-10">
            <QueryBoundary
              isLoading={gems.isLoading}
              isError={gems.isError}
              error={gems.error}
              data={gems.data}
              isEmpty={(data) => data.items.length === 0}
              onRetry={() => void gems.refetch()}
              emptyTitle="No hidden gems right now"
              emptyDescription="A place qualifies only while its popularity stays below the moderation threshold."
            >
              {(data) => <PlaceGrid places={data.items} />}
            </QueryBoundary>
          </div>
        </div>
      </section>

      {/* ============ AI TRIP PLANNER TEASER ============ */}
      <section className="py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeading
              eyebrow="AI trip planner"
              title="Build a trip that feels like yours."
              description="Tell the AI your destination, your pace and your interests. It builds a day-by-day route from places that actually exist and are published — nothing here is invented."
            />
            <ul className="mt-6 space-y-3">
              {[
                'Every activity is a real, published place',
                'Ask it to avoid the crowded ones, and it will',
                'Save the result as a trip you can keep editing',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-foreground/85">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-8 h-12 rounded-full px-6 font-bold shadow-lift">
              <Link href="/planner">
                <Wand2 className="size-5" aria-hidden="true" />
                Generate My Trip
              </Link>
            </Button>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-primary px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground">
                Day by day
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Verified against the database
              </span>
            </div>
            <div className="mt-5 space-y-4 border-l-2 border-dashed border-border pl-5">
              {[
                { time: 'Morning', title: 'A quiet place, chosen for your pace', note: 'Travel time + cost shown on every stop' },
                { time: 'Midday', title: 'Where locals actually eat', note: 'Ranked on quality, not footfall' },
                { time: 'Evening', title: 'A calmer window most miss', note: 'Crowd level flagged before you go' },
              ].map((a) => (
                <div key={a.time} className="relative">
                  <span className="absolute -left-[26px] top-1.5 size-2.5 rounded-full bg-primary ring-4 ring-card" />
                  <div className="flex items-baseline gap-3">
                    <span className="w-16 shrink-0 text-xs font-bold text-muted-foreground">{a.time}</span>
                    <div>
                      <p className="text-sm font-bold tracking-tight">{a.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.note}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 rounded-2xl bg-accent/70 px-4 py-3 text-xs leading-relaxed text-accent-foreground">
              <span className="font-semibold">Why this works:</span> the planner only ever
              references places that are published in Anvesh — an unverifiable stop is dropped,
              not shown.
            </p>
          </div>
        </div>
      </section>

      {/* ============ AI ASSISTANT TEASER ============ */}
      <section className="bg-forest-deep py-24 text-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cream/60">AI travel assistant</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              Ask Anvesh anything.
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-cream/75">
              Describe the kind of place you want, in your own words. Answers are built only from
              places that exist in the Anvesh database — an unverifiable answer is thrown away,
              not shown.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                'I have 2 hours before my train.',
                'Find authentic food under ₹300.',
                'I want a quiet sunset spot nearby.',
                'Show me places tourists usually miss.',
              ].map((q) => (
                <Link
                  key={q}
                  href="/ai"
                  className="rounded-full border border-cream/25 px-3.5 py-1.5 text-xs font-medium text-cream/85 transition-all hover:border-cream/60 hover:text-cream"
                >
                  {q}
                </Link>
              ))}
            </div>
            <Button
              asChild
              size="lg"
              className="mt-8 h-12 rounded-full bg-cream px-6 font-bold text-forest-deep shadow-lift hover:bg-cream/90"
            >
              <Link href="/ai">
                <MessageCircleHeart className="size-5" aria-hidden="true" />
                Open the AI assistant
              </Link>
            </Button>
          </div>

          <div className="rounded-3xl glass-deep p-6 shadow-lift">
            <div className="w-fit max-w-[90%] rounded-2xl rounded-bl-sm bg-cream/10 px-4 py-3 text-sm leading-relaxed text-cream">
              Describe what you're in the mood for, and I'll pull real places with a reason for
              each — not a link, not a guess.
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-full border border-cream/20 px-4 py-2.5 text-sm text-cream/60">
              Ask your local AI anything…
              <Sparkles className="ml-auto size-4" aria-hidden="true" />
            </div>
            <div className="mt-3 flex items-center gap-1.5 pl-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 animate-typing rounded-full bg-cream/70"
                  style={{ animationDelay: `${i * 0.18}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ STORIES ============ */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Local stories"
            title="Stories Behind the Places"
            description="Food traditions, artisan lineages and hidden history — written by the guides who know them, not generated from nothing."
          />
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/stories">
              Read all stories
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="mt-10">
          <QueryBoundary
            isLoading={stories.isLoading}
            isError={stories.isError}
            error={stories.error}
            data={stories.data}
            isEmpty={(data) => data.items.length === 0}
            onRetry={() => void stories.refetch()}
            emptyTitle="No stories yet"
            emptyDescription="Stories are written by guides and published after moderation."
          >
            {(data) => (
              <div className="grid gap-6 md:grid-cols-3">
                {data.items.map((story) => (
                  <UiStoryCard key={story.id} story={story} href={`/stories/${story.slug}`} />
                ))}
              </div>
            )}
          </QueryBoundary>
        </div>
      </section>

      {/* ============ FOR LOCALS ============ */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="rounded-[2.5rem] border border-border bg-card p-8 shadow-soft md:p-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Community"
              title="Meet the locals who make the place"
              description="Guides, artisans, home cooks and hosts — verified by a moderator, recommended by the AI, paid directly by you."
            />
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/partner">
                <Store className="size-4" aria-hidden="true" />
                Are you a local? List your experience
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="mx-auto max-w-7xl px-4 pb-28 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-[2.5rem] shadow-lift"
          style={{ backgroundImage: 'linear-gradient(135deg, #1c422b 0%, #2f6b4b 55%, #6e3f26 130%)' }}
        >
          <div className="anvesh-grain absolute inset-0 opacity-30" aria-hidden="true" />
          <div className="relative px-6 py-20 text-center text-cream md:py-28">
            <MapPin className="mx-auto size-8 text-cream/80" aria-hidden="true" />
            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold tracking-tight md:text-5xl">
              Your next story isn&apos;t on the tourist map.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-cream/80">{TAGLINE}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="h-12 rounded-full px-6 font-bold shadow-lift">
                <Link href="/planner">
                  <Wand2 className="size-5" aria-hidden="true" />
                  Plan My Trip
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-cream/40 bg-cream/10 px-6 font-bold text-cream hover:bg-cream/20 hover:text-cream"
              >
                <Link href="/explore">Explore first</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p> : null}
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-relaxed text-muted-foreground">{description}</p> : null}
    </div>
  );
}