'use client';

import { cn } from '../cn';

/**
 * The image area of a place card.
 *
 * Anvesh has no stock photography and does not invent any: a place carries a
 * photograph only once a guide has uploaded one. Rather than leave a grey box
 * where most of a card's weight should be, an unphotographed place gets a
 * cover generated from its own slug and category — a deterministic gradient
 * plus its initials. The same place always gets the same cover, so a grid
 * still reads as a set of distinct places instead of a row of placeholders.
 *
 * It is decoration derived from real fields, never a stand-in for a real
 * photograph, and it never claims to show the place.
 */

/** Hue pairs chosen to stay legible under the white text laid over them. */
const PALETTES: Array<[string, string]> = [
  ['#2f5d50', '#8aa892'], // ghat green
  ['#7c3216', '#d1855a'], // laterite
  ['#2c4a63', '#7f9fb5'], // river blue
  ['#4a3b62', '#9c8bb4'], // dusk
  ['#5c4a1f', '#bfa361'], // dry grass
  ['#1f4f4a', '#71a89f'], // backwater
  ['#63302f', '#bd8079'], // clay
  ['#31462a', '#89a37a'], // shola
];

/** Stable across reloads and across machines — no randomness anywhere. */
function hash(value: string): number {
  let out = 0;
  for (let i = 0; i < value.length; i += 1) {
    out = (out * 31 + value.charCodeAt(i)) >>> 0;
  }
  return out;
}

function initials(title: string): string {
  const words = title
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const first = words[0]?.[0] ?? 'A';
  const second = words[1]?.[0] ?? '';
  return (first + second).toUpperCase();
}

export interface PlaceCoverProps {
  title: string;
  slug: string;
  image: { url: string; alt: string } | null;
  className?: string;
  /** Adds a bottom-up scrim so overlaid text stays readable. */
  scrim?: boolean;
}

export function PlaceCover({ title, slug, image, className, scrim = true }: PlaceCoverProps) {
  if (image) {
    return (
      <div className={cn('relative overflow-hidden bg-paper-sunk', className)}>
        <img
          src={image.url}
          alt={image.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {scrim ? <div className="anvesh-scrim absolute inset-0" aria-hidden="true" /> : null}
      </div>
    );
  }

  const [from, to] = PALETTES[hash(slug) % PALETTES.length] as [string, string];
  const angle = 120 + (hash(slug + 'a') % 90);

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ backgroundImage: `linear-gradient(${angle}deg, ${from}, ${to})` }}
      /* Decorative: the title is already in the card's heading. */
      aria-hidden="true"
    >
      <div className="anvesh-grain absolute inset-0 opacity-70" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-5xl font-bold text-white/25">{initials(title)}</span>
      </div>
      {scrim ? <div className="anvesh-scrim-soft absolute inset-0" /> : null}
    </div>
  );
}