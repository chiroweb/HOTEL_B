/**
 * Asset resolution helpers.
 *
 * Components use these — never raw paths to public/ or src/assets/.
 * Importing an unknown SLOT-ID is a TypeScript error at compile time;
 * the runtime guards exist only for any-cast escapes.
 */

import {
  IMAGES,
  VIDEOS,
  type ImageSlotId,
  type ImageSpec,
  type VideoSlotId,
  type VideoSpec,
} from '../data/asset-manifest';

export function getImage(slotId: ImageSlotId): ImageSpec {
  const spec = IMAGES[slotId];
  if (!spec) throw new Error(`asset-manifest: image slot "${slotId}" not registered`);
  return spec;
}

export function getVideo(slotId: VideoSlotId): VideoSpec {
  const spec = VIDEOS[slotId];
  if (!spec) throw new Error(`asset-manifest: video slot "${slotId}" not registered`);
  return spec;
}

export type { ImageSlotId, ImageSpec, VideoSlotId, VideoSpec } from '../data/asset-manifest';
