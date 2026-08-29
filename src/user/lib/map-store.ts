import { create } from 'zustand';

export interface MapBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

interface MapState {
  bounds: MapBounds | null;
  selectedPlaceId: string | null;
  maxCrowd: string;
  category: string;
  setBounds: (bounds: MapBounds) => void;
  select: (placeId: string | null) => void;
  setFilter: (patch: { maxCrowd?: string; category?: string }) => void;
}

/** One of only two Zustand stores in this app; everything else is server state. */
export const useMapStore = create<MapState>((set) => ({
  bounds: null,
  selectedPlaceId: null,
  maxCrowd: '',
  category: '',
  setBounds: (bounds) => set({ bounds }),
  select: (selectedPlaceId) => set({ selectedPlaceId }),
  setFilter: (patch) => set(patch),
}));
