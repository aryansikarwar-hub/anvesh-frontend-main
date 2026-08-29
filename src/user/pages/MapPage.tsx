'use client';

import { ChipGroup, PageShell } from '@/ui';
import { DiscoveryMap } from '@/user/components/discovery-map';
import { useCategories } from '@/user/hooks/use-discovery';
import { useMapStore } from '@/user/lib/map-store';

const CROWD_OPTIONS = [
  { value: '', label: 'Any crowd' },
  { value: '0.25', label: 'Rarely crowded' },
  { value: '0.5', label: 'Quiet on weekdays' },
] as const;

/**
 * Smart map — Raahi's "beyond the pins" framing, kept on Anvesh's real
 * MapLibre view: pan the map and the ranking scores what's inside the
 * viewport, quietest and most local first.
 */
export default function MapPage() {
  const { category, maxCrowd, setFilter } = useMapStore();
  const categories = useCategories();

  const categoryOptions = [
    { value: '', label: 'All' },
    ...(categories.data?.categories ?? []).map((item) => ({ value: item.slug, label: item.name })),
  ];

  return (
    <PageShell className="flex flex-col gap-6 py-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-laterite-500">Smart map</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
          The map beyond the pins.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
          Pan the map and Anvesh ranks what&apos;s inside the view, quietest and most local
          first.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-paper-raised p-4 shadow-soft sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <ChipGroup
          label="Category"
          value={category}
          options={categoryOptions}
          onChange={(value) => setFilter({ category: value })}
        />
        <ChipGroup
          label="Crowd"
          value={maxCrowd}
          options={CROWD_OPTIONS}
          onChange={(value) => setFilter({ maxCrowd: value })}
        />
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] shadow-card">
        <DiscoveryMap />
      </div>
    </PageShell>
  );
}