/**
 * Motion engine — minimal.
 *
 * For each <section id> in <main>, lazy-import its motion module and
 * call `setup(el, mode)`. Each module owns its own IntersectionObserver-
 * driven entrance reveal (fade up as scrolled into view).
 *
 * Native browser scroll is preserved end-to-end. No scroll capture,
 * no controller, no magnetic snap.
 */

import { onBreakpointChange, currentMode } from './breakpoint';
import { setHijackActive } from './hijack-mode';
import { onReducedMotionChange, shouldReduce } from './reduced-motion';
import type { Mode } from './types';

let booted = false;
const cleanups: Array<() => void> = [];

export function boot(): void {
  if (booted) return;
  booted = true;

  // Hijack is desktop + non-reduced only. Mobile + reduced-motion fall back
  // to native scroll with each section's own pin/scrub behavior.
  const mode = currentMode();
  setHijackActive(mode === 'desktop' && !shouldReduce());

  void mountSections(mode);

  cleanups.push(
    onReducedMotionChange(() => {
      // No-op for now — reveal modules read shouldReduce() at setup time.
    })
  );
  cleanups.push(
    onBreakpointChange(() => {
      // No-op — sections in normal flow handle their own responsive layout.
    })
  );
}

export function teardown(): void {
  for (const fn of cleanups.splice(0)) fn();
  booted = false;
}

async function mountSections(mode: Mode): Promise<void> {
  if (typeof document === 'undefined') return;
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>('main > section[id]')
  );
  for (const section of sections) {
    const loader = LOADERS[section.id];
    if (!loader) continue;
    try {
      const mod = await loader();
      mod.setup(section, mode);
    } catch (err) {
      console.error(`[motion] failed to mount "${section.id}":`, err);
    }
  }

  // Global section-level effects MUST mount after per-section LOADERS so
  // pin spacers exist before snap targets are computed and stack triggers
  // anchor to post-pin section bottoms. See Path B plan §System-Wide Impact.
  const main = document.getElementById('main');
  if (!main) return;
  for (const [name, loader] of Object.entries(GLOBAL_EFFECTS)) {
    try {
      const mod = await loader();
      mod.setup(main, mode);
    } catch (err) {
      console.error(`[motion] failed to mount global "${name}":`, err);
    }
  }
}

// Suppress unused-import warning for shouldReduce (kept for future hooks).
void shouldReduce;

const LOADERS: Record<string, () => Promise<{ setup: (el: HTMLElement, mode: Mode) => void }>> = {
  coast: () => import('./prologue'),
  landmark: () => import('./landmark'),
  day: () => import('./day'),
  window: () => import('./window'),
  space: () => import('./space'),
  address: () => import('./address'),
};

/**
 * Page-level motion effects that span all sections. Mounted after every
 * per-section LOADER has run so the global controller can read each
 * section's registered hijack controller.
 *
 * scroll-hijack itself is responsible for reading isHijackActive() and
 * skipping its own setup when hijack is off (mobile / reduced-motion).
 * Every section module is also responsible for branching on hijack mode
 * so it does not double-bind ScrollTriggers.
 */
const GLOBAL_EFFECTS: Record<
  string,
  () => Promise<{ setup: (el: HTMLElement, mode: Mode) => void }>
> = {
  'scroll-hijack': () => import('./scroll-hijack'),
};
