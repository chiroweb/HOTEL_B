/**
 * Scroll engine — canonical Lenis × GSAP recipe.
 *
 *   • Lenis runs with `autoRaf: false` so a single rAF source drives both.
 *   • GSAP's ticker calls `lenis.raf(t * 1000)` (ms).
 *   • Lenis emits 'scroll' → ScrollTrigger.update.
 *   • `gsap.ticker.lagSmoothing(0)` is required so scroll-bound tweens don't
 *     skip on tab refocus.
 *   • `ScrollTrigger.config({ ignoreMobileResize: true })` suppresses
 *     iOS URL-bar collapse → resize storm (40–120ms refresh per fire).
 *   • No `scrollerProxy` — Lenis is body-level, ScrollTrigger reads
 *     window.scrollY directly.
 *
 * Lifecycle:
 *   • prefers-reduced-motion / Save-Data / slow effectiveType → reboot.
 *   • desktop ↔ mobile breakpoint flip → restartAll(mode).
 *   • bfcache pagehide/pageshow → engine.stop()/start().
 *   • Vite HMR (dev) → registry.destroy(MODULE_ID) per-module.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { bindBfcache } from './bfcache';
import { currentMode, onBreakpointChange } from './breakpoint';
import { onReducedMotionChange, shouldReduce } from './reduced-motion';
import { destroyAll, restartAll, setMode } from './registry';
import { createSnap, type ManagedSnap } from './snap';

gsap.registerPlugin(ScrollTrigger);

interface EngineState {
  lenis: Lenis | null;
  rafCb: ((time: number) => void) | null;
  snap: ManagedSnap | null;
  cleanups: Array<() => void>;
  running: boolean;
  reduced: boolean;
}

// Only the true page anchors snap. Mid-page pinned sections (Landmark,
// Day, Window, Space) are owned by ScrollTrigger pins; adding them as
// snap targets makes the user "툭" into the pin entry while the pin's
// own offset math is computing — feels grabby. Coast and Address get
// magnetic landing because they ARE the start and end of the page.
const SNAP_TARGETS = ['coast', 'address'];

const state: EngineState = {
  lenis: null,
  rafCb: null,
  snap: null,
  cleanups: [],
  running: false,
  reduced: false,
};

let booted = false;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function boot(): void {
  if (booted) return;
  booted = true;

  setMode(currentMode());
  state.reduced = shouldReduce();

  if (!state.reduced) {
    startEngine();
  } else {
    enableNativeSnapFallback();
  }

  // Mode-change broadcasters always live, even when engine is asleep —
  // turning reduce-motion off should be able to spin the engine back up.
  state.cleanups.push(
    onReducedMotionChange((reduce) => {
      state.reduced = reduce;
      if (reduce) {
        stopEngine();
        enableNativeSnapFallback();
      } else {
        disableNativeSnapFallback();
        startEngine();
      }
    })
  );

  state.cleanups.push(
    onBreakpointChange((mode) => {
      setMode(mode);
      if (state.running) restartAll(mode);
    })
  );

  state.cleanups.push(
    bindBfcache({
      stop: () => stopEngine(),
      start: () => {
        if (!state.reduced) startEngine();
      },
    })
  );

  // Refresh ScrollTrigger once fonts settle so pin offsets account for any
  // late text reflow. Plan §State lifecycle, step 2.
  if (typeof document !== 'undefined' && 'fonts' in document) {
    void document.fonts.ready.then(() => ScrollTrigger.refresh(true));
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => ScrollTrigger.refresh(true), { once: true });
  }

  // iOS Safari snap-cache flush — after every refresh, dispatch a no-op
  // style mutation on <html> so iOS rebuilds its stale snap-point cache
  // (WebKit Bug 245722). No-op on non-iOS.
  if (typeof navigator !== 'undefined' && IS_IOS) {
    ScrollTrigger.addEventListener('refresh', () => {
      const html = document.documentElement;
      const prev = html.style.scrollSnapType;
      html.style.scrollSnapType = 'none';
      requestAnimationFrame(() => {
        html.style.scrollSnapType = prev || '';
      });
    });
  }
}

const IS_IOS =
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1));

export function start(): void {
  startEngine();
}

export function stop(): void {
  stopEngine();
}

export function isRunning(): boolean {
  return state.running;
}

export function getLenis(): Lenis | null {
  return state.lenis;
}

export function teardown(): void {
  stopEngine();
  destroyAll();
  for (const fn of state.cleanups.splice(0)) fn();
  booted = false;
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function startEngine(): void {
  if (state.running || state.reduced) return;

  const lenis = new Lenis({
    autoRaf: false,
    duration: 1.1,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
  });
  state.lenis = lenis;

  // Lenis emits scroll → ScrollTrigger.update (single source of truth for
  // scroll position changes).
  lenis.on('scroll', ScrollTrigger.update);

  // GSAP ticker drives Lenis's rAF (no double rAF).
  const rafCb = (time: number) => {
    lenis.raf(time * 1000);
  };
  state.rafCb = rafCb;
  gsap.ticker.add(rafCb);
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.config({ ignoreMobileResize: true });

  state.snap = createSnap(lenis, {
    ids: SNAP_TARGETS,
    duration: 1.4, // long, predictable landing — not a flick
    velocityThreshold: 0.5, // wait until user has truly stopped
  });

  state.running = true;
}

function stopEngine(): void {
  if (!state.running) return;

  state.snap?.destroy();
  state.snap = null;

  if (state.rafCb) {
    gsap.ticker.remove(state.rafCb);
    state.rafCb = null;
  }

  state.lenis?.destroy();
  state.lenis = null;

  state.running = false;
}

// ---------------------------------------------------------------------------
// Reduced-motion fallback: native CSS scroll-snap on <html>.
// Only engages when Lenis is destroyed (Lenis README forbids combining them).
// ---------------------------------------------------------------------------

function enableNativeSnapFallback(): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.snapFallback = 'on';
}

function disableNativeSnapFallback(): void {
  if (typeof document === 'undefined') return;
  delete document.documentElement.dataset.snapFallback;
}
