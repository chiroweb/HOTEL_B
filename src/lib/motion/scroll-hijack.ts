/**
 * SCROLL-HIJACK — page-level wheel/touch/key controller.
 *
 * Replaces native scrolling on desktop. One input event = one stage advance.
 * During the transition, further input is ignored. After the transition
 * settles, a short cooldown absorbs trackpad inertia, then input resumes.
 *
 * Stages = section list, expanded by per-section controllers in the
 * hijack-registry. Each registered controller declares totalStages > 1
 * (e.g. DAY = 4 frames, LANDMARK = 3 stages); unregistered sections count
 * as 1 stage (the section itself).
 *
 * Section-to-section transitions use a stack effect: outgoing recedes
 * (scale 0.94, opacity drop, slight y in scroll direction), then snaps
 * fully off-screen; incoming rises from off-screen, overlapping briefly
 * during the depth phase.
 *
 * Internal-stage transitions (within DAY or LANDMARK) call the section's
 * controller.advance(subIndex), which the section itself implements
 * (translate stack, cross-fade copy, etc.).
 *
 * Mobile + reduced-motion are handled by NOT activating hijack at all
 * (engine.ts checks before booting); native scroll then drives existing
 * pin+scrub behavior.
 */

import { gsap } from 'gsap';

import { isHijackActive } from './hijack-mode';
import { getController } from './hijack-registry';
import type { Mode } from './types';

const EASE_OUT = 'power3.out';
const EASE_IN = 'power2.in';

const TRANSITION_OUT = 0.7;
const TRANSITION_IN = 1.35;
const INERTIA_QUIET_MS = 160;  // wheel must be silent this long before a new gesture is accepted
const WHEEL_DEAD = 8;          // ignore wheel events with |deltaY| < this
const TOUCH_THRESHOLD = 50;    // px — minimum swipe to count

interface Stage {
  readonly sectionId: string;
  readonly subIndex: number;
}

let stages: Stage[] = [];
let sections: HTMLElement[] = [];
let sectionElById = new Map<string, HTMLElement>();
let currentStageIndex = 0;
let busy = false;            // transition in flight
let canTrigger = true;       // gate: turns false on each wheel event, back to true after INERTIA_QUIET_MS of silence
let wheelQuietTimer: number | null = null;
let lastTouchY = 0;
let booted = false;

export function setup(_root: HTMLElement, _mode: Mode): void {
  if (booted) return;
  if (!isHijackActive()) return; // mobile / reduced-motion → native scroll
  booted = true;

  sections = Array.from(document.querySelectorAll<HTMLElement>('main > section[id]'));
  if (sections.length === 0) return;
  sectionElById = new Map(sections.map((s) => [s.id, s]));

  stages = buildStageList(sections);

  // Lock the page: body becomes a fixed-height container, sections become
  // absolute layers we composite via transform.
  applyHijackStyles();

  // Place every section: first one visible, the rest below the viewport.
  sections.forEach((s, i) => {
    s.style.willChange = 'transform, opacity';
    if (i === 0) {
      gsap.set(s, { y: 0, opacity: 1, scale: 1, zIndex: 2 });
    } else {
      gsap.set(s, { y: '100vh', opacity: 0, scale: 1, zIndex: 1 });
    }
  });

  // Reveal the first section's first sub-stage if it has one.
  const first = stages[0];
  if (first) {
    const ctrl = getController(first.sectionId);
    if (ctrl?.reveal) ctrl.reveal();
  }

  attachListeners();
  syncDots();
}

function buildStageList(sections: HTMLElement[]): Stage[] {
  const list: Stage[] = [];
  for (const sec of sections) {
    const ctrl = getController(sec.id);
    const total = ctrl?.totalStages ?? 1;
    for (let i = 0; i < total; i++) list.push({ sectionId: sec.id, subIndex: i });
  }
  return list;
}

function applyHijackStyles(): void {
  document.documentElement.style.overflow = 'hidden';
  document.documentElement.style.height = '100%';
  document.body.style.overflow = 'hidden';
  document.body.style.height = '100vh';
  document.body.style.margin = '0';
  const main = document.getElementById('main');
  if (main) {
    main.style.position = 'relative';
    main.style.height = '100vh';
    main.style.width = '100vw';
    main.style.overflow = 'visible';
  }
  for (const s of sections) {
    s.style.position = 'fixed';
    s.style.top = '0';
    s.style.left = '0';
    s.style.right = '0';
    s.style.bottom = '0';
    s.style.width = '100vw';
    s.style.height = '100vh';
  }
}

function attachListeners(): void {
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd, { passive: false });
  window.addEventListener('keydown', onKey);
  window.addEventListener('section-dots:jump', onDotJump as EventListener);
}

function onTouchMove(e: TouchEvent): void {
  // Prevent iOS rubber-band bounce while hijack is active.
  e.preventDefault();
}

function onDotJump(e: CustomEvent<{ id: string }>): void {
  jumpToSection(e.detail.id);
}

function onWheel(e: WheelEvent): void {
  e.preventDefault();
  if (Math.abs(e.deltaY) < WHEEL_DEAD) return;

  // Every wheel event extends the inertia window. canTrigger only becomes
  // true again once wheel events have been silent for INERTIA_QUIET_MS,
  // i.e. the trackpad's inertial tail has finished.
  if (wheelQuietTimer !== null) clearTimeout(wheelQuietTimer);
  wheelQuietTimer = window.setTimeout(() => {
    canTrigger = true;
  }, INERTIA_QUIET_MS);

  if (busy || !canTrigger) return;

  // Lock the gate immediately — only the next *fresh* gesture (after the
  // user's wheel events have stopped for INERTIA_QUIET_MS) will fire again.
  canTrigger = false;
  advance(e.deltaY > 0 ? 1 : -1);
}

function onTouchStart(e: TouchEvent): void {
  lastTouchY = e.touches[0]?.clientY ?? 0;
}

function onTouchEnd(e: TouchEvent): void {
  if (busy) return;
  const endY = e.changedTouches[0]?.clientY ?? lastTouchY;
  const dy = lastTouchY - endY; // swipe up = positive
  if (Math.abs(dy) < TOUCH_THRESHOLD) return;
  e.preventDefault();
  advance(dy > 0 ? 1 : -1);
}

function onKey(e: KeyboardEvent): void {
  if (busy) return;
  let dir: 0 | 1 | -1 = 0;
  if (
    e.key === 'ArrowDown' ||
    e.key === 'PageDown' ||
    e.key === ' ' ||
    e.key === 'Spacebar'
  ) {
    dir = 1;
  } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
    dir = -1;
  } else if (e.key === 'Home') {
    jumpTo(0);
    e.preventDefault();
    return;
  } else if (e.key === 'End') {
    jumpTo(stages.length - 1);
    e.preventDefault();
    return;
  }
  if (dir === 0) return;
  e.preventDefault();
  advance(dir);
}

function advance(dir: 1 | -1): void {
  const target = currentStageIndex + dir;
  if (target < 0 || target >= stages.length) return;
  goTo(target, dir);
}

export function jumpTo(targetIndex: number): void {
  if (busy) return;
  if (targetIndex < 0 || targetIndex >= stages.length) return;
  if (targetIndex === currentStageIndex) return;
  const dir: 1 | -1 = targetIndex > currentStageIndex ? 1 : -1;
  goTo(targetIndex, dir);
}

/** Public helper — scroll-dots can call this with a section id. */
export function jumpToSection(sectionId: string): void {
  const idx = stages.findIndex((s) => s.sectionId === sectionId);
  if (idx >= 0) jumpTo(idx);
}

/** Public helper — jump to a specific sub-stage of a section (used by
 *  in-section UI like the SPACE category list). */
export function jumpToStage(sectionId: string, subIndex: number): void {
  const idx = stages.findIndex(
    (s) => s.sectionId === sectionId && s.subIndex === subIndex
  );
  if (idx >= 0) jumpTo(idx);
}

function goTo(targetIndex: number, dir: 1 | -1): void {
  busy = true;
  const cur = stages[currentStageIndex];
  const next = stages[targetIndex];
  const sameSection = cur.sectionId === next.sectionId;

  if (sameSection) {
    // Internal stage advance — the section's controller drives its own
    // cross-fade / translate; busy clears after that duration. The wheel
    // intent gate (INERTIA_QUIET_MS) protects against trackpad inertia
    // separately, so we keep this lockout tight.
    const ctrl = getController(next.sectionId);
    if (ctrl) ctrl.advance(next.subIndex);
    currentStageIndex = targetIndex;
    syncDots();
    syncNav(dir);
    window.setTimeout(() => {
      busy = false;
    }, TRANSITION_IN * 1000);
    return;
  }

  // Section-to-section: stack effect.
  const outEl = sectionElById.get(cur.sectionId);
  const inEl = sectionElById.get(next.sectionId);
  if (!outEl || !inEl) {
    busy = false;
    return;
  }

  // Z-index: incoming on top during the transition.
  outEl.style.zIndex = '2';
  inEl.style.zIndex = '3';

  const incomingFromY = dir > 0 ? '100vh' : '-100vh';
  const outgoingExitY = dir > 0 ? '-100vh' : '100vh';
  const outgoingShiftY = dir > 0 ? '-4vh' : '4vh';

  // Pre-position incoming.
  gsap.set(inEl, { y: incomingFromY, opacity: 0, scale: 1 });

  // Fire incoming section's reveal/advance hook so its first sub-stage
  // shows correctly when it comes into view.
  const inCtrl = getController(next.sectionId);
  if (inCtrl) {
    if (inCtrl.reveal) inCtrl.reveal();
    if (next.subIndex !== 0) inCtrl.advance(next.subIndex);
  }

  // Kill any in-flight tweens on these elements so a previous transition
  // can't fight the new one. The intent gate prevents most overlap, but
  // this is a defensive belt-and-suspenders.
  gsap.killTweensOf([outEl, inEl]);

  const tl = gsap.timeline({
    onComplete: () => {
      // Reset outgoing for future re-entry. The intent gate protects
      // against immediate re-trigger, so no extra cooldown is needed here.
      gsap.set(outEl, { y: outgoingExitY, opacity: 0, scale: 1, zIndex: 1 });
      gsap.set(inEl, { zIndex: 2 });
      currentStageIndex = targetIndex;
      syncDots();
      syncNav(dir);
      busy = false;
    },
  });

  // Outgoing — stack retreat (scale + slight shift + opacity drop).
  tl.to(
    outEl,
    {
      scale: 0.94,
      opacity: 0.5,
      y: outgoingShiftY,
      duration: TRANSITION_OUT,
      ease: EASE_IN,
      overwrite: 'auto',
    },
    0
  );
  // Outgoing — finish off-screen.
  tl.to(
    outEl,
    {
      y: outgoingExitY,
      opacity: 0,
      scale: 1,
      duration: TRANSITION_OUT,
      ease: EASE_OUT,
    },
    TRANSITION_OUT
  );

  // Incoming — rise into view, overlapping retreat.
  tl.to(
    inEl,
    {
      y: 0,
      opacity: 1,
      duration: TRANSITION_IN,
      ease: EASE_OUT,
      overwrite: 'auto',
    },
    0.05
  );
}

function syncDots(): void {
  const cur = stages[currentStageIndex];
  if (!cur) return;
  // Both .section-dot (right rail) and .nav__link (top nav) use the same
  // [data-section] / [data-active] convention; sync them together.
  const targets = document.querySelectorAll<HTMLElement>(
    '.section-dot, .nav__link'
  );
  targets.forEach((el) => {
    el.dataset.active = el.dataset.section === cur.sectionId ? 'true' : 'false';
  });
}

/** No-op since the nav was replaced with two fixed corner icons (logo +
 *  hamburger) that stay visible at all times. Kept as a stub so callers
 *  don't need to be updated; remove once we're sure no auto-hide nav
 *  variant is coming back. */
function syncNav(_dir: 1 | -1): void {
  /* no-op */
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    booted = false;
    busy = false;
    stages = [];
    sections = [];
  });
}
