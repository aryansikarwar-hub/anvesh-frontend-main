import type { StyleSpecification } from 'maplibre-gl';
import { publicEnv } from './env';

export type MapStyle = string | StyleSpecification;

/**
 * Resolves the MapLibre style for the configured provider.
 *
 * Returns null when no provider is configured, which is what makes the map
 * components degrade honestly instead of rendering a blank canvas.
 */
export function buildMapStyle(): MapStyle | null {
  if (publicEnv.mapsProvider === 'ola') {
    if (!publicEnv.olaMapsApiKey) return null;
    return `https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json?api_key=${encodeURIComponent(publicEnv.olaMapsApiKey)}`;
  }

  if (publicEnv.mapsProvider === 'maptiler') {
    if (!publicEnv.mapTilerApiKey) return null;
    return `https://api.maptiler.com/maps/streets-v2/style.json?key=${encodeURIComponent(publicEnv.mapTilerApiKey)}`;
  }

  // A minimal raster style used only when MAPS_PROVIDER is explicitly set to
  // the demo value in local development.
  const demoStyle: StyleSpecification = {
    version: 8,
    sources: {
      demo: {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: 'OpenStreetMap contributors',
      },
    },
    layers: [{ id: 'demo', type: 'raster', source: 'demo' }],
  };
  return demoStyle;
}

export const INDIA_CENTER: [number, number] = [78.9629, 22.5937];