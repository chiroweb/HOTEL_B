/**
 * lenis/snap configuration — magnetic snap for non-pinned sections.
 *
 * Decisions (plan §Key Technical Decisions):
 *   • `type: 'proximity'` (NOT 'mandatory') — avoids iOS Safari
 *     "infinite scroll-to-end" bug WebKit #245722.
 *   • Native CSS `scroll-snap-type` is NOT used here — Lenis explicitly
 *     does not support it (per Lenis README). The native fallback only
 *     activates under reduced-motion when Lenis is destroyed.
 *   • Pinned sections (Day, Space) are NEVER added to snap so they don't
 *     fight ScrollTrigger pin math.
 */

import Snap from 'lenis/snap';

import type Lenis from 'lenis';

export interface SnapTargets {
  /** Element ids of sections that participate in snap. */
  ids: string[];
  /** Lerp coefficient — lower = softer. 0.05–0.1 is the editorial range. */
  lerp?: number;
}

export interface ManagedSnap {
  destroy(): void;
}

export function createSnap(lenis: Lenis, targets: SnapTargets): ManagedSnap | null {
  const snap = new Snap(lenis, {
    type: 'proximity',
    lerp: targets.lerp ?? 0.08,
  });

  let added = 0;
  for (const id of targets.ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    snap.addElement(el, { align: 'start' });
    added += 1;
  }

  if (added === 0) {
    snap.destroy();
    return null;
  }

  return {
    destroy: () => snap.destroy(),
  };
}
