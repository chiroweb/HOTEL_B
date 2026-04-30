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
  /** English display heading shown when this category is active. */
  readonly display: string;
  /** Korean display caption shown when this category is active. */
  readonly displayKo: string;
}

export const SPACE_CATEGORIES: readonly SpaceCategory[] = [
  {
    id: 'rooms',
    label: 'Rooms',
    labelKo: '객실',
    count: 312,
    area: '36–112 ㎡',
    note: 'East-southeast facing. Horizon-line floor plates.',
    imageId: 'AMENITY-ROOMS',
    display: 'Rooms,\nAs Sanctuary.',
    displayKo: '객실은 당신의 정박지가 된다.',
  },
  {
    id: 'pool',
    label: 'Pool',
    labelKo: '풀',
    count: 1,
    area: '420 ㎡',
    note: 'Indoor lap + outdoor reflection pool.',
    imageId: 'AMENITY-POOL',
    display: 'Water,\nAs Mirror.',
    displayKo: '물은 풍경을 다시 비춘다.',
  },
  {
    id: 'dining',
    label: 'Dining',
    labelKo: '다이닝',
    count: 3,
    area: '720 ㎡',
    note: 'All-day · grill · bar.',
    imageId: 'AMENITY-DINING',
    display: 'Table,\nAs Pause.',
    displayKo: '식탁 위에서 하루가 잠시 멈춘다.',
  },
  {
    id: 'fitness',
    label: 'Fitness',
    labelKo: '피트니스',
    count: 1,
    area: '180 ㎡',
    imageId: 'AMENITY-FITNESS',
    display: 'Body,\nAs Practice.',
    displayKo: '몸의 리듬이 다시 정돈된다.',
  },
  {
    id: 'lounge',
    label: 'Lounge',
    labelKo: '라운지',
    count: 1,
    area: '210 ㎡',
    imageId: 'SPACE-HERO',
    display: 'Lounge,\nAs Horizon.',
    displayKo: '머무름은 결국 수평선과 만난다.',
  },
];
