'use client';

import { useParams } from '@/user/router';
import { Link } from '@/user/router';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  PageShell,
  PlaceCover,
  STORY_KIND_LABELS,
  Section,
} from '@/ui';
import { useStory } from '@/user/hooks/use-stories';
import { QueryBoundary } from '@/user/components/query-boundary';

/**
 * One story.
 *
 * The body is stored and rendered as plain text — paragraphs are split on
 * blank lines and nothing is interpreted as markup, which is what keeps a
 * guide-authored field from becoming a stored-XSS hole.
 */
export default function StoryPage() {
  const { slug } = useParams() as { slug: string };
  const query = useStory(slug);

  return (
    <div className="flex flex-col">
      <QueryBoundary
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        data={query.data}
        onRetry={() => void query.refetch()}
        skeleton="rows"
      >
        {({ story }) => (
          <article className="flex flex-col">
            <div className="relative">
              <PlaceCover
                title={story.title}
                slug={story.slug}
                image={story.coverImage}
                className="h-64 w-full sm:h-80 lg:h-[26rem]"
              />
              <PageShell className="absolute inset-x-0 bottom-0 pb-8">
                <div className="flex flex-wrap gap-2 pb-3">
                  <Badge variant="onImage">{STORY_KIND_LABELS[story.kind]}</Badge>
                  <Badge variant="onImage">
                    <Clock className="size-3" aria-hidden="true" />
                    {story.readMinutes} min read
                  </Badge>
                  <Badge variant="onImage">
                    <MapPin className="size-3" aria-hidden="true" />
                    {story.city}, {story.state}
                  </Badge>
                </div>
                <h1 className="max-w-3xl text-3xl text-white sm:text-4xl lg:text-5xl">
                  {story.title}
                </h1>
              </PageShell>
            </div>

            <PageShell className="flex flex-col gap-10 py-8">
              <div className="flex flex-col gap-1">
                <Button asChild variant="ghost" size="sm" className="-ml-2 self-start">
                  <Link href="/stories">
                    <ArrowLeft aria-hidden="true" />
                    All stories
                  </Link>
                </Button>
              </div>

              <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="flex flex-col gap-6">
                  <p className="max-w-2xl text-lg leading-relaxed text-ink-soft">{story.summary}</p>

                  <div className="flex max-w-2xl flex-col gap-5">
                    {story.body
                      .split(/\n\s*\n/)
                      .map((paragraph) => paragraph.trim())
                      .filter(Boolean)
                      .map((paragraph, index) => (
                        <p key={index} className="leading-[1.75] text-ink">
                          {paragraph}
                        </p>
                      ))}
                  </div>

                  {story.tags.length ? (
                    <ul className="flex flex-wrap gap-1.5 pt-2">
                      {story.tags.map((tag) => (
                        <li key={tag}>
                          <Badge variant="neutral">{tag}</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <aside className="flex flex-col gap-5">
                  {story.guideSummary ? (
                    <Card>
                      <CardContent className="flex flex-col gap-2 pt-5">
                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                          Written by
                        </span>
                        <Link
                          href={`/guides/${story.guideSummary.slug}`}
                          className="font-display text-lg font-semibold hover:underline"
                        >
                          {story.guideSummary.displayName}
                        </Link>
                        {story.guideSummary.verified ? (
                          <Badge variant="success" className="self-start">
                            Verified guide
                          </Badge>
                        ) : null}
                        {story.guideSummary.ratingCount > 0 ? (
                          <p className="text-sm text-ink-muted">
                            {story.guideSummary.ratingAvg.toFixed(1)} from{' '}
                            {story.guideSummary.ratingCount} reviews
                          </p>
                        ) : null}
                      </CardContent>
                    </Card>
                  ) : null}

                  {story.publishedAt ? (
                    <p className="text-xs text-ink-faint">
                      Published{' '}
                      {new Date(story.publishedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  ) : null}
                </aside>
              </div>

              {story.places.length ? (
                <Section
                  title="Places in this story"
                  description="Still published, so you can open every one of them."
                >
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {story.places.map((place) => (
                      <Card key={place.placeId} className="anvesh-rise overflow-hidden">
                        <div className="flex items-center gap-3">
                          <PlaceCover
                            title={place.title}
                            slug={place.slug}
                            image={
                              place.coverImageUrl
                                ? { url: place.coverImageUrl, alt: place.title }
                                : null
                            }
                            scrim={false}
                            className="size-20 shrink-0"
                          />
                          <div className="min-w-0 flex-1 py-3 pr-4">
                            <h3 className="truncate text-sm font-semibold">
                              <Link href={`/places/${place.slug}`} className="hover:underline">
                                {place.title}
                              </Link>
                            </h3>
                            <p className="flex items-center gap-1 pt-0.5 text-xs text-ink-muted">
                              <MapPin className="size-3" aria-hidden="true" />
                              {place.city}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Section>
              ) : null}
            </PageShell>
          </article>
        )}
      </QueryBoundary>
    </div>
  );
}