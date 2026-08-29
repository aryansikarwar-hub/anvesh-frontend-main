'use client';

import { Link } from '@/user/router';
import {
  ArrowRight,
  BadgeCheck,
  CalendarRange,
  IndianRupee,
  LineChart,
  MapPinned,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { Button, Card, CardContent, HeroBand, PageShell, Section } from '@/ui';

/**
 * The public page for guides, cooks, artisans and hosts — the entry point to
 * the Tourist Guide portal at /guide.
 *
 * Everything claimed here is a feature that exists in the portal. There are no
 * invented statistics about how many partners have joined or what they earn.
 */

const WHAT_YOU_GET = [
  {
    icon: MapPinned,
    title: 'List places and experiences',
    body: 'Add the places you know with real details — entry fee, best months, how long it takes, what to watch out for. Moderation reviews each one before it goes live.',
  },
  {
    icon: CalendarRange,
    title: 'Run your own calendar',
    body: 'Publish slots with seat counts and prices, in bulk if you need to. Seats are held atomically, so two travellers can never take the same last seat.',
  },
  {
    icon: IndianRupee,
    title: 'Get paid on real bookings',
    body: 'Bookings are paid through Razorpay. Your earnings page shows gross, the platform commission and your net — no estimates, only settled figures.',
  },
  {
    icon: LineChart,
    title: 'See what is actually working',
    body: 'Views and saves per place, day by day, and your view-to-booking rate. Counted from real interaction events, not sampled.',
  },
  {
    icon: Star,
    title: 'Reviews you can answer',
    body: 'Only travellers who completed a booking can review it. Your rating is computed from those reviews and nothing else.',
  },
  {
    icon: ShieldCheck,
    title: 'Your data stays yours',
    body: 'Every guide query is scoped to your own records. Another guide asking for your place gets a 404, not a leak.',
  },
];

const STEPS = [
  {
    step: '1',
    title: 'Create a guide account',
    body: 'Register on the guide portal and verify your email. A guide profile is created with the account.',
  },
  {
    step: '2',
    title: 'Fill in your guide profile',
    body: 'Sign in at the guide portal and add your headline, languages, base city and specialities.',
  },
  {
    step: '3',
    title: 'Publish and get discovered',
    body: 'Add places and experiences, submit them for review, then open your calendar. Anvesh ranks quiet, locally owned places above famous ones — that is where you start from.',
  },
];

export default function PartnerPage() {
  return (
    <div className="flex flex-col gap-14 pb-4">
      <HeroBand tone="laterite" className="rounded-none">
        <PageShell className="flex flex-col items-start gap-5 py-16 sm:py-20">
          <span className="rounded-[var(--radius-pill)] bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white ring-1 ring-white/25 backdrop-blur-sm">
            For locals
          </span>
          <h1 className="max-w-3xl text-4xl leading-[1.1] sm:text-5xl">
            You know the place. Put it on the map on your terms.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            Anvesh is built so that a quiet, locally owned place outranks a famous one. If you are a
            guide, cook, artisan or host, that ranking is working in your favour.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button asChild size="lg" variant="onImage">
              <Link href="/guide/register">
                Register as a guide
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-white/12 text-white ring-1 ring-white/30 backdrop-blur-sm hover:bg-white/20"
            >
              <Link href="/guide/login">Sign in to the guide portal</Link>
            </Button>
          </div>
        </PageShell>
      </HeroBand>

      <PageShell className="flex flex-col gap-14">
        <Section
          title="What the guide portal gives you"
          description="Every one of these is a screen in the portal, backed by the same API the traveller site uses."
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHAT_YOU_GET.map((item) => (
              <Card key={item.title} className="anvesh-rise">
                <CardContent className="flex flex-col gap-2 pt-5">
                  <item.icon className="size-5 text-laterite-500" aria-hidden="true" />
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-muted">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="Getting started" description="Three steps, and the first two take a minute.">
          <ol className="grid gap-5 md:grid-cols-3">
            {STEPS.map((step) => (
              <li
                key={step.step}
                className="rounded-[var(--radius-card)] bg-paper-raised p-5 shadow-soft ring-1 ring-line/70"
              >
                <span className="inline-flex size-8 items-center justify-center rounded-[var(--radius-pill)] bg-laterite-50 font-display text-sm font-bold text-laterite-600">
                  {step.step}
                </span>
                <h3 className="pt-3 text-base font-semibold">{step.title}</h3>
                <p className="pt-1.5 text-sm leading-relaxed text-ink-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Card>
          <CardContent className="flex flex-col items-start gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <BadgeCheck className="mt-0.5 size-6 shrink-0 text-ghat-500" aria-hidden="true" />
              <div>
                <h2 className="text-base font-semibold">Verification is a real check</h2>
                <p className="pt-1 max-w-xl text-sm leading-relaxed text-ink-muted">
                  A verified badge is granted by a moderator, not by filling in a form. Until then
                  you can still publish — verification changes how much weight your listings carry,
                  not whether they exist.
                </p>
              </div>
            </div>
            <Button asChild variant="secondary" className="shrink-0">
              <Link href="/guide/login">Sign in as a guide</Link>
            </Button>
          </CardContent>
        </Card>
      </PageShell>
    </div>
  );
}