/**
 * lenis/snap configuration — editorial magnetic snap.
 *
 * Decisions:
 *   • `type: 'proximity'` (NOT 'mandatory') — avoids iOS Safari
 *     WebKit #245722 ("infinite scroll-to-end") and lets the user
 *     read mid-section without being yanked.
 *   • `velocityThreshold` is intentionally low (0.5 px/ms) so snap only
 *     engages once the user has truly come to rest. Magnetic pull
 *     during active scroll feels grabby — that's the "툭툭" effect we
 *     want to remove.
 *   • Snap motion uses `duration` + `easeOutExpo`, NOT `lerp`. Duration
 *     gives predictable timing across devices; the easing matches the
 *     editorial reveal curve so the landing reads as part of the
 *     section's own motion language, not a separate scroll mechanic.
 *   • GSAP-pinned sections (Landmark, Day, Window, Space) are NEVER
 *     added to snap so they don't fight ScrollTrigger pin math —
 *     including section starts that GSAP would itself land on. Only
 *     the two true page anchors (Coast at top, Address at bottom) are
 *     snap targets; sliding through the middle is unobstructed.
 *   • Native CSS scroll-snap is not used here (Lenis README forbids
 *     combining); native is only the reduced-motion fallback.
 */

import Snap from 'lenis/snap';

import type Lenis from 'lenis';

export interface SnapTargets {
  /** Element ids of sections that participate in snap. */
  ids: string[];
  /** Lerp coefficient if `duration` is not set. Lower = softer. */
  lerp?: number;
  /** Hard duration of the snap motion in seconds. Overrides lerp. */
  duration?: number;
  /** Px/ms — snap won't fire above this velocity. */
  velocityThreshold?: number;
}

export interface ManagedSnap {
  destroy(): void;
}

// easeOutExpo — same family as the editorial reveal ease used elsewhere
// (cubic-bezier(0.22, 1, 0.36, 1)). Lands long and quiet.
const easeOutExpo = (t: number): number =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

export function createSnap(lenis: Lenis, targets: SnapTargets): ManagedSnap | null {
  const snapOptions: Record<string, unknown> = {
    type: 'proximity',
    velocityThreshold: targets.velocityThreshold ?? 0.5,
    easing: easeOutExpo,
  };

  if (targets.duration !== undefined) {
    snapOptions.duration = targets.duration;
  } else {
    snapOptions.lerp = targets.lerp ?? 0.05;
  }

  const snap = new Snap(lenis, snapOptions as ConstructorParameters<typeof Snap>[1]);

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
