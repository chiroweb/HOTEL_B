/**
 * Asset manifest — single source of truth for all media slots.
 *
 * All assets live in S3 (`chiro-web` bucket, `hotel_b/` prefix) and are
 * served as direct URLs. No `<Picture>` / no Astro image pipeline — every
 * consumer renders a plain `<img>` or `<video>` against the absolute URL
 * exposed here.
 *
 * Replacement workflow:
 *   1. Upload final file to s3://chiro-web/hotel_b/{placeholders|videos}/.
 *   2. Update the corresponding entry below (or change the SLOT-ID's URL).
 *   3. No component edits required.
 */

const S3 = 'https://chiro-web.s3.ap-northeast-2.amazonaws.com/hotel_b';
const IMG = `${S3}/placeholders`;
const VID = `${S3}/videos`;

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
  | 'SPACE-HERO'
  | 'DAY-MORNING-A'
  | 'DAY-MORNING-B'
  | 'DAY-DAY-A'
  | 'DAY-DAY-B'
  | 'DAY-NIGHT-A'
  | 'DAY-NIGHT-B'
  | 'DAY-MIDNIGHT-A'
  | 'DAY-MIDNIGHT-B'
  | 'AMENITY-ROOMS'
  | 'AMENITY-LOUNGE'
  | 'AMENITY-POOL'
  | 'AMENITY-DINING'
  | 'AMENITY-FITNESS'
  | 'ROOM-DETAIL-3'
  | 'ROOM-DETAIL-4'
  | 'LANDMARK-BG'
  | 'LANDMARK-FACADE'
  | 'LANDMARK-A1'
  | 'LANDMARK-A2'
  | 'LANDMARK-B1'
  | 'LANDMARK-C1'
  | 'LANDMARK-C2'
  | 'LANDMARK-C3'
  | 'LANDMARK-C4';
// Reserved (added as sections graduate):
//   'LANDMARK-03'
// | `SPACE-${string}`
// | 'EPILOGUE-01'

export type VideoSlotId =
  | 'PROLOGUE-01'
  | 'WINDOW-BG'
  | 'COAST-01'
  | 'COAST-02'
  | 'COAST-03';

// ---------------------------------------------------------------------------
// Spec types — components consume these directly.
// ---------------------------------------------------------------------------

export interface ImageSpec {
  readonly kind: 'image';
  /** Public S3 URL — pass straight to <img src=...>. */
  readonly url: string;
  /** Always provide a real alt unless the image is purely decorative (then ''). */
  readonly alt: string;
  /** Sizes attribute (legacy; only matters if a component still uses srcset). */
  readonly sizes: string;
  /** Tone notes — what kind of photograph this slot expects. */
  readonly tone: string;
}

export interface VideoSourceLadder {
  readonly src: string;
  readonly type: string;
}

export interface VideoSpec {
  readonly kind: 'video';
  /** Source ladder: AV1 first, H.264 fallback. */
  readonly sources: readonly VideoSourceLadder[];
  /** Poster fallback URL. */
  readonly poster: string;
  readonly posterAlt: string;
  readonly duration?: string;
  readonly tone: string;
}

// ---------------------------------------------------------------------------
// Live manifest entries.
// ---------------------------------------------------------------------------

export const IMAGES: Record<ImageSlotId, ImageSpec> = {
  'PROLOGUE-01': {
    kind: 'image',
    url: `${IMG}/PROLOGUE-01-poster.jpg`,
    alt: 'Songjeong coast at sunrise — quiet horizon, low rocks at left, gentle surf reflecting golden light on wet sand.',
    sizes: '100vw',
    tone: 'Minimal sunrise over Songjeong. No people, asymmetric framing, warm-desaturated grade aligned with site cream/ivory base.',
  },
  'LANDMARK-02': {
    kind: 'image',
    url: `${IMG}/LANDMARK-02.jpg`,
    alt: 'Close-up of the WYNDHAM Songjeong facade — glass curtain wall, vertical fin pattern, and warm sunset reflections.',
    sizes: '(max-width: 768px) 100vw, 40vw',
    tone: 'Facade macro — glass panels with vertical fins, sunset reflections in the curtain wall. Architectural close-up.',
  },
  'FLOW-MORNING': {
    kind: 'image',
    url: `${IMG}/FLOW-MORNING.jpg`,
    alt: 'Songjeong shoreline at sunrise — sun low on the eastern horizon, soft surf reflections on wet sand.',
    sizes: '80vw',
    tone: '06:12 — east-facing sunrise. Warm horizon glow with reflections on receding tide.',
  },
  'FLOW-SURF': {
    kind: 'image',
    url: `${IMG}/FLOW-SURF.jpg`,
    alt: 'Songjeong coast at mid-day — clear teal water, white sand, no figures.',
    sizes: '80vw',
    tone: '13:40 — mid-day quiet. Clear teal-blue water, restrained sky, no people.',
  },
  'FLOW-WALK': {
    kind: 'image',
    url: `${IMG}/FLOW-WALK.jpg`,
    alt: 'Two small figures walking along Songjeong shoreline at golden hour, sun low on horizon.',
    sizes: '80vw',
    tone: '18:27 — golden-hour walk. Two distant silhouettes, long shadows on wet sand, restrained warmth.',
  },
  'FLOW-LIGHT': {
    kind: 'image',
    url: `${IMG}/FLOW-LIGHT.jpg`,
    alt: 'Songjeong coast at blue hour — deep navy sky, distant city lights, calm surf.',
    sizes: '80vw',
    tone: '21:05 — blue hour. Deep navy sea + sky, scatter of warm city lights at the headland edge.',
  },
  'WINDOW-01': {
    kind: 'image',
    url: `${IMG}/WINDOW-01.jpg`,
    alt: 'A guest stands at the floor-to-ceiling window of a Songjeong suite, looking out across the bay toward the headland.',
    sizes: '100vw',
    tone: 'Soft morning light. Bedding and chair recede into warm beige; the view through the window is the subject.',
  },
  'WINDOW-02': {
    kind: 'image',
    url: `${IMG}/WINDOW-02.jpg`,
    alt: '',
    sizes: '(max-width: 768px) 60vw, 22vw',
    tone: 'Suite desk corner: ceramic mug, brass desk lamp, sheer curtain glowing with sunset light. Warm cinematic.',
  },
  'WINDOW-03': {
    kind: 'image',
    url: `${IMG}/WINDOW-03.jpg`,
    alt: '',
    sizes: '(max-width: 768px) 60vw, 22vw',
    tone: 'Suite alt corner: full sheer curtain at left letting in cool day light, framed artwork at right. Cooler atmosphere.',
  },
  'SPACE-HERO': {
    kind: 'image',
    url: `${IMG}/SPACE-HERO.jpg`,
    alt: 'WYNDHAM Songjeong public lounge — double-height ceiling, full-height windows facing the bay at sunset, low warm furniture.',
    sizes: '(max-width: 768px) 100vw, 60vw',
    tone: 'Portrait architectural — high-ceiling lounge with sunset light through floor-to-ceiling windows. Brass + tan + warm wood.',
  },
  'DAY-MORNING-A': {
    kind: 'image',
    url: `${IMG}/morning1.png`,
    alt: 'WYNDHAM Songjeong — early morning view, soft horizon and warm low light.',
    sizes: '80vw',
    tone: 'Morning — main frame.',
  },
  'DAY-MORNING-B': {
    kind: 'image',
    url: `${IMG}/morning2.png`,
    alt: '',
    sizes: '(max-width: 768px) 60vw, 18vw',
    tone: 'Morning — float frame.',
  },
  'DAY-DAY-A': {
    kind: 'image',
    url: `${IMG}/day1.png`,
    alt: 'WYNDHAM Songjeong — mid-day light across the bay.',
    sizes: '80vw',
    tone: 'Day — main frame.',
  },
  'DAY-DAY-B': {
    kind: 'image',
    url: `${IMG}/day2.png`,
    alt: '',
    sizes: '(max-width: 768px) 60vw, 18vw',
    tone: 'Day — float frame.',
  },
  'DAY-NIGHT-A': {
    kind: 'image',
    url: `${IMG}/night1.png`,
    alt: 'WYNDHAM Songjeong — evening light, deepening sky over the headland.',
    sizes: '80vw',
    tone: 'Night — main frame.',
  },
  'DAY-NIGHT-B': {
    kind: 'image',
    url: `${IMG}/night2.png`,
    alt: '',
    sizes: '(max-width: 768px) 60vw, 18vw',
    tone: 'Night — float frame.',
  },
  'DAY-MIDNIGHT-A': {
    kind: 'image',
    url: `${IMG}/midnight1.png`,
    alt: 'WYNDHAM Songjeong — late-night view with quiet city lights.',
    sizes: '80vw',
    tone: 'Midnight — main frame.',
  },
  'DAY-MIDNIGHT-B': {
    kind: 'image',
    url: `${IMG}/midnight2.png`,
    alt: '',
    sizes: '(max-width: 768px) 60vw, 18vw',
    tone: 'Midnight — float frame.',
  },
  'AMENITY-ROOMS': {
    kind: 'image',
    url: `${IMG}/hotelroomdetails.png`,
    alt: 'WYNDHAM Songjeong guest room — interior detail.',
    sizes: '(max-width: 768px) 100vw, 60vw',
    tone: 'Rooms — interior detail.',
  },
  'AMENITY-LOUNGE': {
    kind: 'image',
    url: `${IMG}/hotelroomdetails2.png`,
    alt: 'WYNDHAM Songjeong lounge — interior detail.',
    sizes: '(max-width: 768px) 100vw, 60vw',
    tone: 'Lounge — interior detail.',
  },
  'AMENITY-POOL': {
    kind: 'image',
    url: `${IMG}/pool.png`,
    alt: 'WYNDHAM Songjeong pool.',
    sizes: '(max-width: 768px) 100vw, 60vw',
    tone: 'Pool.',
  },
  'AMENITY-DINING': {
    kind: 'image',
    url: `${IMG}/dinning.png`,
    alt: 'WYNDHAM Songjeong dining venue.',
    sizes: '(max-width: 768px) 100vw, 60vw',
    tone: 'Dining.',
  },
  'AMENITY-FITNESS': {
    kind: 'image',
    url: `${IMG}/fitniss.png`,
    alt: 'WYNDHAM Songjeong fitness center.',
    sizes: '(max-width: 768px) 100vw, 60vw',
    tone: 'Fitness.',
  },
  'ROOM-DETAIL-3': {
    kind: 'image',
    url: `${IMG}/hotelroomdetailis3.png`,
    alt: '',
    sizes: '(max-width: 768px) 60vw, 22vw',
    tone: 'Suite detail — secondary editorial frame.',
  },
  'ROOM-DETAIL-4': {
    kind: 'image',
    url: `${IMG}/hotelroomdetails4.png`,
    alt: '',
    sizes: '(max-width: 768px) 60vw, 22vw',
    tone: 'Suite detail — secondary editorial frame.',
  },
  'LANDMARK-BG': {
    kind: 'image',
    url: `${IMG}/LANDMARK-BG.png`,
    alt: 'WYNDHAM Songjeong — landmark hero backdrop, atmospheric exterior.',
    sizes: '100vw',
    tone: 'Section 2 hero backdrop — atmospheric building/site shot, cinematic, restrained palette.',
  },
  'LANDMARK-FACADE': {
    kind: 'image',
    url: `${IMG}/LANDMARK-FACADE.png`,
    alt: '',
    sizes: '(max-width: 768px) 80vw, 36vw',
    tone: 'Landmark facade — vertical glass + brass.',
  },
  'LANDMARK-A1': {
    kind: 'image',
    url: `${IMG}/LANDMARK-A1.png`,
    alt: '',
    sizes: '(max-width: 768px) 60vw, 28vw',
    tone: 'Landmark editorial detail A1.',
  },
  'LANDMARK-A2': {
    kind: 'image',
    url: `${IMG}/LANDMARK-A2.png`,
    alt: '',
    sizes: '(max-width: 768px) 60vw, 24vw',
    tone: 'Landmark editorial detail A2.',
  },
  'LANDMARK-B1': {
    kind: 'image',
    url: `${IMG}/LANDMARK-B1.png`,
    alt: '',
    sizes: '(max-width: 768px) 70vw, 32vw',
    tone: 'Landmark editorial detail B1.',
  },
  'LANDMARK-C1': {
    kind: 'image',
    url: `${IMG}/LANDMARK-C1.png`,
    alt: '',
    sizes: '(max-width: 768px) 60vw, 22vw',
    tone: 'Landmark editorial detail C1.',
  },
  'LANDMARK-C2': {
    kind: 'image',
    url: `${IMG}/LANDMARK-C2.png`,
    alt: '',
    sizes: '(max-width: 768px) 60vw, 22vw',
    tone: 'Landmark editorial detail C2.',
  },
  'LANDMARK-C3': {
    kind: 'image',
    url: `${IMG}/LANDMARK-C3.png`,
    alt: '',
    sizes: '(max-width: 768px) 60vw, 22vw',
    tone: 'Landmark editorial detail C3.',
  },
  'LANDMARK-C4': {
    kind: 'image',
    url: `${IMG}/LANDMARK-C4.png`,
    alt: '',
    sizes: '(max-width: 768px) 60vw, 22vw',
    tone: 'Landmark editorial detail C4.',
  },
};

export const VIDEOS: Record<VideoSlotId, VideoSpec> = {
  'PROLOGUE-01': {
    kind: 'video',
    sources: [
      { src: `${VID}/PROLOGUE-01.av1.mp4`, type: 'video/mp4; codecs="av01.0.05M.08"' },
      { src: `${VID}/PROLOGUE-01.h264.mp4`, type: 'video/mp4; codecs="avc1.640028"' },
    ],
    poster: `${IMG}/PROLOGUE-01-poster.jpg`,
    posterAlt: 'Songjeong coast at sunrise.',
    duration: '30s sequence',
    tone: 'Three-clip narrative.',
  },
  'WINDOW-BG': {
    kind: 'video',
    sources: [
      { src: `${VID}/WINDOW-bg.mp4`, type: 'video/mp4' },
    ],
    poster: `${IMG}/WINDOW-01.jpg`,
    posterAlt:
      'A guest stands at the floor-to-ceiling window of a Songjeong suite, looking out across the bay toward the headland.',
    duration: 'loop',
    tone: 'Suite window — moving for atmospheric presence.',
  },
  'COAST-01': {
    kind: 'video',
    sources: [
      { src: `${VID}/COAST-01.mp4`, type: 'video/mp4' },
    ],
    poster: `${IMG}/PROLOGUE-01-poster.jpg`,
    posterAlt: '',
    duration: 'clip 1',
    tone: 'Coast hero clip 1 — first in the 1→2→3 mask sequence.',
  },
  'COAST-02': {
    kind: 'video',
    sources: [
      { src: `${VID}/COAST-02.mp4`, type: 'video/mp4' },
    ],
    poster: `${IMG}/PROLOGUE-01-poster.jpg`,
    posterAlt: '',
    duration: 'clip 2',
    tone: 'Coast hero clip 2 — second in the 1→2→3 mask sequence.',
  },
  'COAST-03': {
    kind: 'video',
    sources: [
      { src: `${VID}/COAST-03.mp4`, type: 'video/mp4' },
    ],
    poster: `${IMG}/PROLOGUE-01-poster.jpg`,
    posterAlt: '',
    duration: 'clip 3',
    tone: 'Coast hero clip 3 — third in the 1→2→3 mask sequence.',
  },
};
