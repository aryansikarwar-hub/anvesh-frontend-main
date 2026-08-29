'use client';

import { ChipGroup, Input, cn } from '@/ui';
import { useCategories } from '@/user/hooks/use-discovery';

export interface Filters {
  q: string;
  categories: string;
  state: string;
  maxCrowd: string;
  maxEntryFeeMinor: string;
  ownership: string;
  sort: string;
}

export const DEFAULT_FILTERS: Filters = {
  q: '',
  categories: '',
  state: '',
  maxCrowd: '',
  maxEntryFeeMinor: '',
  ownership: '',
  sort: 'recommended',
};

/**
 * Note what is absent: there is no "most popular" sort. The API does not accept
 * one either, so the option cannot be re-added by a URL edit.
 */
const SORTS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'quietest', label: 'Quietest first' },
  { value: 'rating', label: 'Best rated' },
  { value: 'newest', label: 'Recently added' },
] as const;

const CROWD = [
  { value: '', label: 'Any crowd' },
  { value: '0.25', label: 'Low crowd' },
  { value: '0.5', label: 'Moderate' },
  { value: '0.75', label: 'Busy is fine' },
] as const;

/** Values are paise, because that is what the API takes. */
const BUDGET = [
  { value: '', label: 'Any budget' },
  { value: '0', label: 'Free' },
  { value: '30000', label: 'Under ₹300' },
  { value: '80000', label: 'Under ₹800' },
] as const;

const OWNERSHIP = [
  { value: '', label: 'Anyone' },
  { value: 'LOCAL_OWNED', label: 'Locally owned' },
  { value: 'COMMUNITY', label: 'Community run' },
  { value: 'GOVERNMENT', label: 'Government' },
] as const;

/**
 * Filters as rows of pills rather than a sidebar of selects: on a discovery
 * screen the available choices are part of the content, and hiding them behind
 * a dropdown costs a tap for every one of them.
 */
export function DiscoveryFilters({
  filters,
  onChange,
  onReset,
  className,
}: {
  filters: Filters;
  onChange: (next: Partial<Filters>) => void;
  onReset: () => void;
  className?: string;
}) {
  const categories = useCategories();
  const dirty = Object.keys(DEFAULT_FILTERS).some(
    (key) => filters[key as keyof Filters] !== DEFAULT_FILTERS[key as keyof Filters],
  );

  const categoryOptions = [
    { value: '', label: 'All' },
    ...(categories.data?.categories ?? []).map((category) => ({
      value: category.slug,
      label: category.name,
    })),
  ];

  return (
    <div className={cn('flex flex-col gap-4', className)} aria-label="Filters">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="filter-q" className="sr-only">
            Search within results
          </label>
          <Input
            id="filter-q"
            value={filters.q}
            onChange={(event) => onChange({ q: event.target.value })}
            placeholder="Search these results — waterfall, bazaar, homestay"
          />
        </div>
        <div className="sm:w-52">
          <label htmlFor="filter-state" className="sr-only">
            State
          </label>
          <Input
            id="filter-state"
            value={filters.state}
            onChange={(event) => onChange({ state: event.target.value })}
            placeholder="State — Karnataka"
          />
        </div>
      </div>

      <ChipGroup
        label="Category"
        value={filters.categories}
        options={categoryOptions}
        onChange={(value) => onChange({ categories: value })}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ChipGroup
          label="Budget"
          value={filters.maxEntryFeeMinor}
          options={BUDGET}
          onChange={(value) => onChange({ maxEntryFeeMinor: value })}
        />
        <ChipGroup
          label="Crowd"
          value={filters.maxCrowd}
          options={CROWD}
          onChange={(value) => onChange({ maxCrowd: value })}
        />
        <ChipGroup
          label="Owned by"
          value={filters.ownership}
          options={OWNERSHIP}
          onChange={(value) => onChange({ ownership: value })}
        />
        <ChipGroup
          label="Sort"
          value={filters.sort}
          options={SORTS}
          onChange={(value) => onChange({ sort: value })}
        />
      </div>

      {dirty ? (
        <div>
          <button
            type="button"
            onClick={onReset}
            className="text-sm font-medium text-laterite-600 underline underline-offset-4"
          >
            Clear all filters
          </button>
        </div>
      ) : null}
    </div>
  );
}