/**
 * SPACE — sub-category content.
 *
 * Data-driven so the timeline renders 0..N items based on what the user
 * supplies. No card UI — info renders as text + 1px hairlines per R6/R4.
 *
 * imageId points each category at an asset slot so the SPACE frame can
 * cross-fade to the matching photo when the user hovers a category.
 * Initial mapping reuses existing slots; replace with dedicated photos
 * (rooms / pool / dining / fitness / lounge) in asset-manifest.ts when
 * available — no component change needed.
 */

import type { ImageSlotId } from './asset-manifest';

export interface SpaceCategory {
  readonly id: string;
  readonly label: string;
  readonly labelKo: string;
  readonly count: number;
  readonly area: string;
  readonly note?: string;
  readonly imageId: ImageSlotId;
}

export const SPACE_CATEGORIES: readonly SpaceCategory[] = [
  {
    id: 'rooms',
    label: 'Rooms',
    labelKo: '객실',
    count: 312,
    area: '36–112 ㎡',
    note: 'East-southeast facing. Horizon-line floor plates.',
    imageId: 'WINDOW-01',
  },
  {
    id: 'pool',
    label: 'Pool',
    labelKo: '풀',
    count: 1,
    area: '420 ㎡',
    note: 'Indoor lap + outdoor reflection pool.',
    imageId: 'SPACE-HERO',
  },
  {
    id: 'dining',
    label: 'Dining',
    labelKo: '다이닝',
    count: 3,
    area: '720 ㎡',
    note: 'All-day · grill · bar.',
    imageId: 'WINDOW-02',
  },
  {
    id: 'fitness',
    label: 'Fitness',
    labelKo: '피트니스',
    count: 1,
    area: '180 ㎡',
    imageId: 'WINDOW-03',
  },
  {
    id: 'lounge',
    label: 'Lounge',
    labelKo: '라운지',
    count: 1,
    area: '210 ㎡',
    imageId: 'SPACE-HERO',
  },
];
