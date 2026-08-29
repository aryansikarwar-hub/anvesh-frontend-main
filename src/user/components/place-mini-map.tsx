'use client';

import { useEffect, useRef, useState } from 'react';
import { buildMapStyle } from '@/user/lib/map-style';

/**
 * A small MapLibre canvas for a single place.
 *
 * Ola Maps supplies the tiles when a key is configured. Without one the map
 * degrades to a plain coordinate readout and says so, rather than rendering an
 * empty grey box that looks broken.
 */
export function PlaceMiniMap({ lng, lat, title }: { lng: number; lat: number; title: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const style = buildMapStyle();

  useEffect(() => {
    if (!container.current || !style) return;
    let map: { remove: () => void } | null = null;
    let cancelled = false;

    void (async () => {
      try {
        const maplibre = await import('maplibre-gl');
        if (cancelled || !container.current) return;
        const instance = new maplibre.Map({
          container: container.current,
          style,
          center: [lng, lat],
          zoom: 11,
          attributionControl: { compact: true },
        });
        new maplibre.Marker({ color: '#7a3e12' }).setLngLat([lng, lat]).addTo(instance);
        instance.addControl(new maplibre.NavigationControl({ showCompass: false }), 'top-right');
        map = instance;
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lng, lat, style]);

  if (!style || failed) {
    return (
      <div className="rounded-[var(--radius-control)] border border-dashed border-line-strong bg-paper-sunk p-4 text-sm text-ink-muted">
        <p className="font-medium text-ink-soft">{title}</p>
        <p className="pt-1 font-mono text-xs">
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
        <p className="pt-2 text-xs">
          Map tiles need VITE_OLA_MAPS_API_KEY. Coordinates are shown instead.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={container}
      role="img"
      aria-label={`Map showing the location of ${title}`}
      className="h-48 w-full overflow-hidden rounded-[var(--radius-control)] border border-line"
    />
  );
}