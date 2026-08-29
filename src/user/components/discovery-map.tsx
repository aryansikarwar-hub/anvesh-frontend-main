'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@/user/router';
import { Badge, Card, CardContent, EmptyState, ErrorState, LoadingState } from '@/ui';
import { useMapPlaces } from '@/user/hooks/use-discovery';
import { useMapStore } from '@/user/lib/map-store';
import { buildMapStyle, INDIA_CENTER } from '@/user/lib/map-style';
import { describeError } from '@/user/lib/api';

interface MapLike {
  remove: () => void;
  getBounds: () => { getWest: () => number; getSouth: () => number; getEast: () => number; getNorth: () => number };
  on: (event: string, handler: () => void) => void;
}

/**
 * Map discovery.
 *
 * The map asks the API for whatever is inside the current viewport, and the
 * API ranks those results with the same popularity penalty as everywhere else.
 * With no tile key configured the map is replaced by an honest notice and the
 * results list still works.
 */
export function DiscoveryMap() {
  const container = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ remove: () => void }[]>([]);
  const mapRef = useRef<MapLike | null>(null);
  const [tilesFailed, setTilesFailed] = useState(false);

  const bounds = useMapStore((s) => s.bounds);
  const setBounds = useMapStore((s) => s.setBounds);
  const maxCrowd = useMapStore((s) => s.maxCrowd);
  const category = useMapStore((s) => s.category);

  const style = buildMapStyle();
  const query = useMapPlaces(bounds, {
    ...(category ? { categories: category } : {}),
    ...(maxCrowd ? { maxCrowd: Number(maxCrowd) } : {}),
  });

  const syncBounds = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const b = map.getBounds();
    setBounds({
      west: b.getWest(),
      south: b.getSouth(),
      east: b.getEast(),
      north: b.getNorth(),
    });
  }, [setBounds]);

  useEffect(() => {
    if (!style) {
      // No tiles: still show results for a sensible default window.
      setBounds({ west: 68, south: 6.5, east: 97.5, north: 37.6 });
      return;
    }
    if (!container.current) return;
    let cancelled = false;

    void (async () => {
      try {
        const maplibre = await import('maplibre-gl');
        if (cancelled || !container.current) return;
        const map = new maplibre.Map({
          container: container.current,
          style,
          center: INDIA_CENTER,
          zoom: 4,
        });
        map.addControl(new maplibre.NavigationControl({ showCompass: false }), 'top-right');
        map.on('load', syncBounds);
        map.on('moveend', syncBounds);
        mapRef.current = map as unknown as MapLike;
      } catch {
        if (!cancelled) setTilesFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [style, syncBounds, setBounds]);

  // Redraw markers whenever the result set changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !query.data) return;
    let cancelled = false;

    void (async () => {
      const maplibre = await import('maplibre-gl');
      if (cancelled) return;
      for (const marker of markersRef.current) marker.remove();
      markersRef.current = query.data.items.map((place) => {
        const marker = new maplibre.Marker({
          color: place.crowdLevel <= 0.3 ? '#2f5d50' : '#a8551c',
        })
          .setLngLat(place.location.coordinates)
          .setPopup(
            new maplibre.Popup({ offset: 16 }).setHTML(
              `<strong>${escapeHtml(place.title)}</strong><br/><span>${escapeHtml(place.city)}</span>`,
            ),
          )
          .addTo(map as never);
        return marker;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [query.data]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="order-2 lg:order-1">
        {style && !tilesFailed ? (
          <div
            ref={container}
            role="application"
            aria-label="Map of discoverable places"
            className="h-[420px] w-full overflow-hidden rounded-[var(--radius-card)] border border-line lg:h-[70vh]"
          />
        ) : (
          <div className="flex h-[300px] items-center justify-center rounded-[var(--radius-card)] border border-dashed border-line-strong bg-paper-sunk p-6 text-center lg:h-[70vh]">
            <div className="max-w-sm">
              <p className="font-medium">Map tiles are not configured</p>
              <p className="pt-2 text-sm text-ink-muted">
                Set VITE_OLA_MAPS_API_KEY to render the map. The results beside this panel
                are live from the API regardless.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="order-1 flex flex-col gap-3 lg:order-2 lg:max-h-[70vh] lg:overflow-y-auto">
        <MapResults query={query} />
      </div>
    </div>
  );
}

function MapResults({ query }: { query: ReturnType<typeof useMapPlaces> }) {
  if (query.isLoading) return <LoadingState rows={4} label="Loading places in view" />;
  if (query.isError) {
    const described = describeError(query.error);
    return (
      <ErrorState
        title={described.title}
        description={described.description}
        {...(described.requestId ? { requestId: described.requestId } : {})}
        onRetry={() => void query.refetch()}
      />
    );
  }
  if (!query.data || query.data.items.length === 0) {
    return (
      <EmptyState
        title="Nothing published in this view"
        description="Pan or zoom out. Places only appear once a moderator has published them."
      />
    );
  }

  return (
    <>
      <p className="text-sm text-ink-muted">{query.data.items.length} places in view</p>
      {query.data.items.map((place) => (
        <Card key={place.id}>
          <CardContent className="flex flex-col gap-1.5 pt-4">
            <div className="flex items-center gap-2">
              <Badge variant={place.crowdLevel <= 0.3 ? 'quiet' : 'neutral'}>
                {place.crowdLevel <= 0.3 ? 'Quiet' : 'Busier'}
              </Badge>
              {place.ownership === 'LOCAL_OWNED' ? <Badge variant="local">Local</Badge> : null}
            </div>
            <h3 className="text-base leading-snug">
              <Link href={`/places/${place.slug}`} className="hover:underline">
                {place.title}
              </Link>
            </h3>
            <p className="line-clamp-2 text-sm text-ink-muted">{place.summary}</p>
            <p className="text-xs text-ink-faint">
              {place.city}, {place.state}
            </p>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}