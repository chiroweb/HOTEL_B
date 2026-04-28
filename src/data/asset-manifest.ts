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
// Removed (file retained on disk, not imported):
//   'LANDMARK-01' — CG twin-tower render with WYNDHAM media-facade panel.
//   See docs/plans/2026-04-28-001-refactor-landmark-architectural-annotation-plan.md.

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
    alt: 'Songjeong coast at sunrise — quiet horizon, low rocks at left, gentle surf reflecting golden light on wet sand.',
    sizes: '100vw',
    widths: [480, 960, 1440, 1920],
    tone: 'Minimal sunrise over Songjeong. No people, asymmetric framing, warm-desaturated grade aligned with site cream/ivory base.',
  },
  'LANDMARK-02': {
    kind: 'image',
    import: landmark02,
    alt: 'Close-up of the WYNDHAM Songjeong facade — glass curtain wall, vertical fin pattern, and warm sunset reflections.',
    sizes: '(max-width: 768px) 100vw, 40vw',
    widths: [480, 720, 1200],
    tone: 'Facade macro — glass panels with vertical fins, sunset reflections in the curtain wall. Architectural close-up.',
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
    alt: 'Songjeong coast at mid-day — clear teal water, white sand, no figures.',
    sizes: '80vw',
    widths: [960, 1440, 1920],
    tone: '13:40 — mid-day quiet. Clear teal-blue water, restrained sky, no people.',
  },
  'FLOW-WALK': {
    kind: 'image',
    import: flowWalk,
    alt: 'Two small figures walking along Songjeong shoreline at golden hour, sun low on horizon.',
    sizes: '80vw',
    widths: [960, 1440, 1920],
    tone: '18:27 — golden-hour walk. Two distant silhouettes, long shadows on wet sand, restrained warmth.',
  },
  'FLOW-LIGHT': {
    kind: 'image',
    import: flowLight,
    alt: 'Songjeong coast at blue hour — deep navy sky, distant city lights, calm surf.',
    sizes: '80vw',
    widths: [960, 1440, 1920],
    tone: '21:05 — blue hour. Deep navy sea + sky, scatter of warm city lights at the headland edge.',
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
    tone: 'Suite desk corner: ceramic mug, brass desk lamp, sheer curtain glowing with sunset light. Warm cinematic.',
  },
  'WINDOW-03': {
    kind: 'image',
    import: window03,
    alt: '',
    sizes: '(max-width: 768px) 60vw, 22vw',
    widths: [320, 480, 800],
    tone: 'Suite alt corner: full sheer curtain at left letting in cool day light, framed artwork at right. Cooler atmosphere.',
  },
  'SPACE-HERO': {
    kind: 'image',
    import: spaceHero,
    alt: 'WYNDHAM Songjeong public lounge — double-height ceiling, full-height windows facing the bay at sunset, low warm furniture.',
    sizes: '(max-width: 768px) 100vw, 60vw',
    widths: [600, 900, 1200],
    tone: 'Portrait architectural — high-ceiling lounge with sunset light through floor-to-ceiling windows. Brass + tan + warm wood.',
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
      'Songjeong coast at sunrise — quiet horizon, low rocks at left, gentle surf reflecting golden light.',
    duration: '30s sequence',
    tone: 'Three-clip narrative: beach + city → hotel exterior + couple → suite view + headland. Sequenced so each clip ends near the next clip\'s opening framing.',
  },
};
