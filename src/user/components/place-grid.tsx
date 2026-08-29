'use client';

import { type PlaceCard as PlaceCardData } from '@/lib/types';
import { PlaceCard } from '@/ui';
import { useSavePlace } from '@/user/hooks/use-discovery';
import { useCurrentUser } from '@/user/hooks/use-session';

export function PlaceGrid({ places }: { places: PlaceCardData[] }) {
  const { isAuthenticated } = useCurrentUser();
  const save = useSavePlace();

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {places.map((place) => (
        <PlaceCard
          key={place.id}
          place={place}
          href={`/places/${place.slug}`}
          {...(isAuthenticated ? { onSave: (id: string) => save.mutate(id) } : {})}
        />
      ))}
    </div>
  );
}