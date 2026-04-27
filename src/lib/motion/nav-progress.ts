/**
 * Active-section nav state via Lenis scroll progress.
 *
 * Why not IntersectionObserver alone:
 *   Long pinned sections (Day ≈ 400svh, Space ≈ 300svh) do not change
 *   IntersectionObserver state mid-pin, so the nav would appear stuck on
 *   the pre-pin section even after the user has scrolled deep into the pin.
 *   Computing active id from scroll position against pre-declared section
 *   ranges survives long pins.
 *
 * Refresh contract:
 *   `recompute()` MUST be called after `ScrollTrigger.refresh()` and after
 *   any pin construction so `[start, end]` ranges reflect post-pin layout.
 */

import type Lenis from 'lenis';

interface SectionRange {
  id: string;
  start: number;
  end: number;
}

export interface ManagedNavProgress {
  recompute(): void;
  destroy(): void;
}

export function bindNavProgress(
  lenis: Lenis,
  sectionIds: string[],
  onActiveChange: (id: string | null) => void
): ManagedNavProgress {
  let ranges: SectionRange[] = [];
  let lastActive: string | null = null;

  const recompute = () => {
    const next: SectionRange[] = [];
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const start = rect.top + window.scrollY;
      next.push({ id, start, end: start + el.offsetHeight });
    }
    ranges = next;
    update();
  };

  const update = () => {
    const y = window.scrollY + window.innerHeight * 0.4;
    let active: string | null = null;
    for (const range of ranges) {
      if (y >= range.start && y < range.end) {
        active = range.id;
        break;
      }
    }
    if (active === null && ranges.length > 0 && y >= ranges[ranges.length - 1].end) {
      active = ranges[ranges.length - 1].id;
    }
    if (active !== lastActive) {
      lastActive = active;
      onActiveChange(active);
    }
  };

  const onScroll = () => update();
  lenis.on('scroll', onScroll);

  recompute();

  return {
    recompute,
    destroy: () => {
      lenis.off('scroll', onScroll);
    },
  };
}
