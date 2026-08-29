'use client';

import { Link } from '@/user/router';
import { useParams } from '@/user/router';
import { Languages, MapPin, Star } from 'lucide-react';
import { Badge, Card, CardContent, LoadingState, Money, PageShell, Section } from '@/ui';
import { useExperienceList, useGuide } from '@/user/hooks/use-content';
import { QueryBoundary } from '@/user/components/query-boundary';

export default function GuidePage() {
  const { slug } = useParams() as { slug: string };
  const query = useGuide(slug);
  const experiences = useExperienceList({ guideSlug: slug });

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
        {({ guide }) => (
          <div className="flex flex-col gap-10">
            <header className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {guide.verified ? <Badge variant="success">Verified guide</Badge> : null}
                {guide.specialities.map((speciality) => (
                  <Badge key={speciality}>{speciality.replace(/-/g, ' ')}</Badge>
                ))}
              </div>
              <h1 className="text-3xl sm:text-4xl">{guide.displayName}</h1>
              <p className="max-w-3xl text-lg text-ink-soft">{guide.headline}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" aria-hidden="true" />
                  {guide.baseCity}, {guide.baseState}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Languages className="size-4" aria-hidden="true" />
                  {guide.languages.join(', ')}
                </span>
                <span>{guide.yearsExperience} years guiding</span>
                {guide.ratingCount > 0 ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="size-4 fill-gold-500 text-gold-500" aria-hidden="true" />
                    {guide.ratingAvg.toFixed(1)} ({guide.ratingCount})
                  </span>
                ) : null}
              </div>
            </header>

            {guide.bio ? (
              <section className="max-w-3xl">
                <h2 className="pb-2 text-xl">In their words</h2>
                <p className="whitespace-pre-line leading-relaxed text-ink-soft">{guide.bio}</p>
              </section>
            ) : null}

            <Section
              title="Experiences they run"
              description="Booked through Anvesh, paid to the guide less the platform commission."
            >
              {experiences.isLoading ? (
                <LoadingState rows={2} />
              ) : experiences.data && experiences.data.items.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {experiences.data.items.map((experience) => (
                    <Card key={experience.id}>
                      <CardContent className="flex flex-col gap-2 pt-5">
                        <h3 className="text-base leading-snug">
                          <Link
                            href={`/experiences/${experience.slug}`}
                            className="hover:underline"
                          >
                            {experience.title}
                          </Link>
                        </h3>
                        <p className="line-clamp-2 text-sm text-ink-muted">{experience.summary}</p>
                        <div className="pt-1 text-sm">
                          <Money minor={experience.basePriceMinor} suffix="per person" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-muted">
                  This guide has no published experiences right now.
                </p>
              )}
            </Section>
          </div>
        )}
      </QueryBoundary>
    </PageShell>
  );
}