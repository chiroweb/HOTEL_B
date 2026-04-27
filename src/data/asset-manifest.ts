/**
 * Asset manifest — single source of truth for all media slots.
 *
 * Typed split (R12, plan §Key Technical Decisions):
 *   • Stills live under src/assets/ and are imported as ImageMetadata so
 *     Astro's <Image> pipeline emits hashed AVIF + responsive widths.
 *   • Videos live under public/ (Astro doesn't transform video) and are
 *     referenced by absolute path in a <source> ladder (AV1 → H.264).
 *
 * Replacement workflow:
 *   1. Drop final file(s) into src/assets/placeholders/ or public/videos/.
 *   2. Edit the `final` field for the SLOT-ID in this file.
 *   3. Update the corresponding row in docs/assets-needed.md.
 *   No component edits required (R12).
 */

import type { ImageMetadata } from 'astro';

import prologuePoster from '../assets/placeholders/PROLOGUE-01-poster.jpg';
import landmark01 from '../assets/placeholders/LANDMARK-01.jpg';
import landmark02 from '../assets/placeholders/LANDMARK-02.jpg';
import flowMorning from '../assets/placeholders/FLOW-MORNING.jpg';
import flowSurf from '../assets/placeholders/FLOW-SURF.jpg';
import flowWalk from '../assets/placeholders/FLOW-WALK.jpg';
import flowLight from '../assets/placeholders/FLOW-LIGHT.jpg';
import window01 from '../assets/placeholders/WINDOW-01.jpg';
import window02 from '../assets/placeholders/WINDOW-02.jpg';
import window03 from '../assets/placeholders/WINDOW-03.jpg';
import spaceHero from '../assets/placeholders/SPACE-HERO.jpg';

// ---------------------------------------------------------------------------
// Slot identifiers — extended in Phase 2 (Units 8–12) as sections are built.
// ---------------------------------------------------------------------------

export type ImageSlotId =
  | 'PROLOGUE-01'
  | 'LANDMARK-01'
  | 'LANDMARK-02'
  | 'FLOW-MORNING'
  | 'FLOW-SURF'
  | 'FLOW-WALK'
  | 'FLOW-LIGHT'
  | 'WINDOW-01'
  | 'WINDOW-02'
  | 'WINDOW-03'
  | 'SPACE-HERO';
// Reserved (added as sections graduate):
//   'LANDMARK-03'
// | `SPACE-${string}`
// | 'EPILOGUE-01'

export type VideoSlotId = 'PROLOGUE-01';

// ---------------------------------------------------------------------------
// Spec types — components consume these directly (no string-path manipulation).
// ---------------------------------------------------------------------------

export interface ImageSpec {
  readonly kind: 'image';
  /** Astro <Image> source — Astro emits hashed AVIF/WebP/responsive widths from this. */
  readonly import: ImageMetadata;
  /** Always provide a real alt unless the image is purely decorative (then ''). */
  readonly alt: string;
  /** Sizes attribute for responsive srcset selection. */
  readonly sizes: string;
  /** Widths Astro should generate (1x..ultra-wide). */
  readonly widths: readonly number[];
  /** Tone notes — what kind of photograph this slot expects. */
  readonly tone: string;
  /** Filled in when finals replace placeholders. */
  readonly final?: ImageMetadata;
}

export interface VideoSourceLadder {
  readonly src: string;
  readonly type: string;
}

export interface VideoSpec {
  readonly kind: 'video';
  /** Source ladder: AV1 first (smaller, modern), H.264 fallback last. HEVC dropped. */
  readonly sources: readonly VideoSourceLadder[];
  /** Poster fallback frame — also drives LCP for hero compositions. */
  readonly poster: ImageMetadata;
  readonly posterAlt: string;
  readonly duration?: string;
  readonly tone: string;
  readonly final?: {
    readonly sources: readonly VideoSourceLadder[];
    readonly poster: ImageMetadata;
  };
}

// ---------------------------------------------------------------------------
// Live manifest entries.
// ---------------------------------------------------------------------------

export const IMAGES: Record<ImageSlotId, ImageSpec> = {
  'PROLOGUE-01': {
    kind: 'image',
    import: prologuePoster,
    alt: 'Songjeong coast at first light, small pavilion silhouette on the headland with waves washing onto the sand.',
    sizes: '100vw',
    widths: [480, 960, 1440, 1920],
    tone: 'Sunrise over Songjeong, asymmetric framing with pavilion at left. Warm-desaturated grade.',
  },
  'LANDMARK-01': {
    kind: 'image',
    import: landmark01,
    alt: 'Twin towers of the WYNDHAM Songjeong rising above the coastal promenade at dusk.',
    sizes: '(max-width: 768px) 100vw, 60vw',
    widths: [540, 720, 1080],
    tone: 'Twin tower silhouette at dusk. INTERIM placeholder — preserves architectural massing; final photography should remove the lit media-facade panel and shoot at blue/dawn hour for a non-advertorial register.',
  },
  'LANDMARK-02': {
    kind: 'image',
    import: landmark02,
    alt: 'Architectural facade detail with regular grid pattern, warm-cool reflection (placeholder).',
    sizes: '(max-width: 768px) 100vw, 40vw',
    widths: [480, 720, 1200],
    tone: 'Facade detail — material/glass/edge close-up. Macro feel.',
  },
  'FLOW-MORNING': {
    kind: 'image',
    import: flowMorning,
    alt: 'Songjeong shoreline at sunrise — sun low on the eastern horizon, soft surf reflections on wet sand.',
    sizes: '80vw',
    widths: [960, 1440, 1920],
    tone: '06:12 — east-facing sunrise. Warm horizon glow with reflections on receding tide.',
  },
  'FLOW-SURF': {
    kind: 'image',
    import: flowSurf,
    alt: 'Songjeong coast at mid-day, warmer cream tones, restrained motion (placeholder).',
    sizes: '80vw',
    widths: [960, 1440, 1920],
    tone: '13:40 — mid-day quiet. Warmer cream, surf line implied.',
  },
  'FLOW-WALK': {
    kind: 'image',
    import: flowWalk,
    alt: 'Songjeong beach at late afternoon with surfers and the Busan coastline beyond the bay.',
    sizes: '80vw',
    widths: [960, 1440, 1920],
    tone: '18:27 — golden-hour walking pace. Long shadows, restrained color, distant skyline as context.',
  },
  'FLOW-LIGHT': {
    kind: 'image',
    import: flowLight,
    alt: 'Songjeong coast at blue hour, deep navy with warm light flecks (placeholder).',
    sizes: '80vw',
    widths: [960, 1440, 1920],
    tone: '21:05 — blue hour. Deep navy with brass-light flecks. Lights on.',
  },
  'WINDOW-01': {
    kind: 'image',
    import: window01,
    alt: 'A guest stands at the floor-to-ceiling window of a Songjeong suite, looking out across the bay toward the headland.',
    sizes: '100vw',
    widths: [960, 1440, 1920],
    tone: 'Soft morning light. Bedding and chair recede into warm beige; the view through the window is the subject.',
  },
  'WINDOW-02': {
    kind: 'image',
    import: window02,
    alt: '',
    sizes: '(max-width: 768px) 60vw, 22vw',
    widths: [320, 480, 800],
    tone: 'Warm still-life detail (cup/sill/fabric/light). Floating editorial frame.',
  },
  'WINDOW-03': {
    kind: 'image',
    import: window03,
    alt: '',
    sizes: '(max-width: 768px) 60vw, 22vw',
    widths: [320, 480, 800],
    tone: 'Cooler atmospheric detail. Floating editorial frame, second.',
  },
  'SPACE-HERO': {
    kind: 'image',
    import: spaceHero,
    alt: 'Architectural composition of layered structural elements with brass hairline rules (placeholder).',
    sizes: '(max-width: 768px) 100vw, 60vw',
    widths: [600, 900, 1200],
    tone: 'Portrait architectural — warm structural rhythm with brass hairline accents. Crosses left to dominate during state 2.',
  },
};

export const VIDEOS: Record<VideoSlotId, VideoSpec> = {
  'PROLOGUE-01': {
    kind: 'video',
    sources: [
      // AV1 first — modern decoders pick this; ~3.5x smaller than H.264 at equal quality.
      { src: '/videos/PROLOGUE-01.av1.mp4', type: 'video/mp4; codecs="av01.0.05M.08"' },
      // H.264 fallback for older Safari/Chrome and any decoder without AV1.
      { src: '/videos/PROLOGUE-01.h264.mp4', type: 'video/mp4; codecs="avc1.640028"' },
    ],
    poster: prologuePoster,
    posterAlt:
      'Songjeong coastal horizon at quiet daylight, warm-desaturated tone (placeholder).',
    duration: '6s loop',
    tone: 'Slow ken-burns over coastal horizon. Loop-friendly, no cuts. Replace with real coastal footage.',
  },
};
