/**
 * LANDMARK — multi-stage cross-fade with two paths.
 *
 * Hijack mode (desktop, default): each .landmark__stage is a full-bleed
 * absolute layer. Advancing between stages runs a stack transition
 * identical in feel to the section-to-section transition in scroll-hijack:
 *   - outgoing stage: scale 0.94, opacity drop, slight Y in scroll
 *     direction, then off-screen
 *   - incoming stage: rises from off-screen
 *   - within the incoming stage, copy + each photo enter at staggered
 *     tempos for depth (different durations + start offsets per photo)
 *
 * Each advance() call kills any in-flight tweens on the affected
 * elements and builds a fresh timeline — no shared scrubbed timeline.
 *
 * Non-hijack mode (mobile + reduced-motion): natural vertical flow; all
 * stages visible.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { isHijackActive } from './hijack-mode';
import { register as registerController } from './hijack-registry';
import { shouldReduce } from './reduced-motion';
import type { Mode } from './types';

gsap.registerPlugin(ScrollTrigger);

const EASE_IN = 'power2.in';
const EASE_OUT = 'power3.out';
const STAGE_OUT = 0.7;        // outgoing retreat phase
const STAGE_IN = 1.25;        // incoming rise phase
const COPY_DELAY = 0.28;      // copy starts after stage starts rising
const ART_BASE_DELAY = 0.42;  // first photo enters this much after stage rise begins
const ART_STAGGER = 0.24;     // each subsequent photo offsets by this

export function setup(sectionEl: HTMLElement, mode: Mode): void {
  const reduce = shouldReduce();
  const stages = Array.from(sectionEl.querySelectorAll<HTMLElement>('.landmark__stage'));
  const dots = Array.from(sectionEl.querySelectorAll<HTMLElement>('.landmark__dot'));
  if (stages.length === 0) return;

  if (reduce || mode === 'mobile') {
    // Vertical natural flow — make all stages visible.
    for (const stage of stages) {
      stage.style.opacity = '1';
    }
    return;
  }

  if (isHijackActive()) {
    setupHijack(stages, dots);
    return;
  }

  setupScrubPin(sectionEl, stages, dots);
}

function setupHijack(stages: HTMLElement[], dots: HTMLElement[]): void {
  // Pre-position each stage as a full-bleed layer.
  stages.forEach((stage, i) => {
    if (i === 0) {
      gsap.set(stage, { y: 0, opacity: 1, scale: 1 });
      preState(stage, false);
    } else {
      gsap.set(stage, { y: '60vh', opacity: 0, scale: 1 });
      preState(stage, true);
    }
  });

  setActiveDot(dots, 0);

  let currentIndex = 0;

  registerController('landmark', {
    totalStages: stages.length,
    advance: (toIndex: number) => {
      const clamped = Math.max(0, Math.min(stages.length - 1, toIndex));
      if (clamped === currentIndex) return;
      const dir: 1 | -1 = clamped > currentIndex ? 1 : -1;
      const out = stages[currentIndex];
      const inc = stages[clamped];
      runStageTransition(out, inc, dir);
      currentIndex = clamped;
      setActiveDot(dots, clamped);
    },
    reveal: () => {
      // Re-fire stage 0's entrance reveal when LANDMARK becomes the active
      // section (called by scroll-hijack on section enter).
      const first = stages[0];
      if (first) playStageEnter(first, 1);
    },
  });
}

/** Sets each stage's inner copy + photos to their off-position starting state. */
function preState(stage: HTMLElement, hidden: boolean): void {
  const copy = stage.querySelector<HTMLElement>('.landmark__copy');
  const arts = Array.from(stage.querySelectorAll<HTMLElement>('.landmark__art'));
  if (hidden) {
    if (copy) gsap.set(copy, { y: 28, opacity: 0 });
    arts.forEach((a) => gsap.set(a, { y: 44, opacity: 0 }));
  } else {
    if (copy) gsap.set(copy, { y: 0, opacity: 1 });
    arts.forEach((a) => gsap.set(a, { y: 0, opacity: 1 }));
  }
}

/** Runs the stack transition between two stages. dir > 0 = forward (next),
 *  dir < 0 = backward (prev). */
function runStageTransition(out: HTMLElement, inc: HTMLElement, dir: 1 | -1): void {
  const incCopy = inc.querySelector<HTMLElement>('.landmark__copy');
  const incArts = Array.from(inc.querySelectorAll<HTMLElement>('.landmark__art'));
  const outCopy = out.querySelector<HTMLElement>('.landmark__copy');
  const outArts = Array.from(out.querySelectorAll<HTMLElement>('.landmark__art'));

  // Pre-position incoming for entrance.
  gsap.killTweensOf([out, inc, ...incArts, ...outArts]);
  if (incCopy) gsap.killTweensOf(incCopy);
  if (outCopy) gsap.killTweensOf(outCopy);

  gsap.set(inc, { y: dir > 0 ? '60vh' : '-60vh', opacity: 0, scale: 1 });
  if (incCopy) gsap.set(incCopy, { y: 28, opacity: 0 });
  incArts.forEach((a) => gsap.set(a, { y: 44, opacity: 0 }));

  // Z-index so incoming reads above outgoing during the depth phase.
  out.style.zIndex = '2';
  inc.style.zIndex = '3';

  const tl = gsap.timeline({
    onComplete: () => {
      // Reset outgoing fully off-screen for re-entry on reverse.
      gsap.set(out, { y: dir > 0 ? '-60vh' : '60vh', opacity: 0, scale: 1, zIndex: 1 });
      gsap.set(inc, { zIndex: 2 });
    },
  });

  // Outgoing — stack retreat (scale + opacity drop + slight shift).
  tl.to(
    out,
    { scale: 0.94, opacity: 0.45, y: dir > 0 ? '-4vh' : '4vh', duration: STAGE_OUT, ease: EASE_IN },
    0
  );
  tl.to(
    out,
    { y: dir > 0 ? '-60vh' : '60vh', opacity: 0, scale: 1, duration: STAGE_OUT, ease: EASE_OUT },
    STAGE_OUT
  );
  if (outCopy) tl.to(outCopy, { y: -16, opacity: 0, duration: STAGE_OUT, ease: EASE_IN }, 0);
  outArts.forEach((a, i) => {
    tl.to(a, { y: -28, opacity: 0, duration: STAGE_OUT, ease: EASE_IN }, 0 + i * 0.04);
  });

  // Incoming — section-level rise.
  tl.to(inc, { y: 0, opacity: 1, duration: STAGE_IN, ease: EASE_OUT }, 0.08);

  // Incoming — copy slightly delayed.
  if (incCopy) {
    tl.to(incCopy, { y: 0, opacity: 1, duration: 0.7, ease: EASE_OUT }, COPY_DELAY);
  }

  // Incoming — photos staggered with DIFFERENT durations for depth feel.
  // Each photo's duration grows slightly: 0.7s, 0.85s, 1.0s, ...
  incArts.forEach((a, i) => {
    const start = ART_BASE_DELAY + i * ART_STAGGER;
    const dur = 0.7 + i * 0.13;
    tl.to(a, { y: 0, opacity: 1, duration: dur, ease: EASE_OUT }, start);
  });
}

/** Used by reveal() — replays the first stage's entrance with the same
 *  staggered tempo so it feels alive when the section first appears. */
function playStageEnter(stage: HTMLElement, dirHint: 1 | -1): void {
  const copy = stage.querySelector<HTMLElement>('.landmark__copy');
  const arts = Array.from(stage.querySelectorAll<HTMLElement>('.landmark__art'));
  void dirHint; // kept for signature symmetry

  // Only animate elements that haven't already revealed.
  if (copy && copy.style.opacity !== '1') {
    gsap.fromTo(copy, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: EASE_OUT, delay: 0.05 });
  }
  arts.forEach((a, i) => {
    if (a.style.opacity === '1') return;
    const start = 0.18 + i * ART_STAGGER;
    const dur = 0.7 + i * 0.13;
    gsap.fromTo(a, { y: 44, opacity: 0 }, { y: 0, opacity: 1, duration: dur, ease: EASE_OUT, delay: start });
  });
}

/** Original scrub-pin path for non-hijack environments (mobile keeps natural
 *  flow, reduced-motion ditto, but desktop without hijack — e.g., dev — gets
 *  the prior 3-stage scrub for parity. */
function setupScrubPin(
  sectionEl: HTMLElement,
  stages: HTMLElement[],
  dots: HTMLElement[]
): void {
  for (let i = 0; i < stages.length; i++) {
    gsap.set(stages[i], { opacity: i === 0 ? 1 : 0 });
    const arts = stages[i].querySelectorAll<HTMLElement>('.landmark__art');
    const copy = stages[i].querySelector<HTMLElement>('.landmark__copy');
    arts.forEach((a) => gsap.set(a, { y: i === 0 ? 0 : 32, opacity: i === 0 ? 1 : 0 }));
    if (copy) gsap.set(copy, { y: i === 0 ? 0 : 24, opacity: i === 0 ? 1 : 0 });
  }
  setActiveDot(dots, 0);

  const tl = gsap.timeline({
    defaults: { ease: 'cubic-bezier(0.22, 1, 0.36, 1)', duration: 1 },
    scrollTrigger: {
      trigger: sectionEl,
      start: 'top top',
      end: '+=300%',
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      snap: { snapTo: 'labels', duration: { min: 0.25, max: 0.9 }, ease: 'power2.inOut' },
      onUpdate: (self) => {
        const idx = Math.min(stages.length - 1, Math.floor(self.progress * stages.length + 0.0001));
        setActiveDot(dots, idx);
      },
    },
  });

  tl.addLabel('s1', 0);
  tl.addLabel('s1-out', 0.45);
  tl.to(stages[0], { opacity: 0 }, 's1-out');
  const s1Copy = stages[0].querySelector<HTMLElement>('.landmark__copy');
  const s1Arts = stages[0].querySelectorAll<HTMLElement>('.landmark__art');
  if (s1Copy) tl.to(s1Copy, { y: -18, opacity: 0, duration: 0.6 }, 's1-out');
  s1Arts.forEach((a, i) => tl.to(a, { y: -22, opacity: 0, duration: 0.6 }, 's1-out+=' + i * 0.05));

  tl.addLabel('s2', 0.6);
  tl.to(stages[1], { opacity: 1 }, 's2-=0.2');
  const s2Copy = stages[1].querySelector<HTMLElement>('.landmark__copy');
  const s2Arts = stages[1].querySelectorAll<HTMLElement>('.landmark__art');
  if (s2Copy) tl.to(s2Copy, { y: 0, opacity: 1, duration: 0.7 }, 's2-=0.15');
  s2Arts.forEach((a, i) => tl.to(a, { y: 0, opacity: 1, duration: 0.7 }, 's2-=0.1+=' + i * 0.07));

  if (stages[2]) {
    tl.addLabel('s2-out', 1.5);
    tl.to(stages[1], { opacity: 0 }, 's2-out');
    if (s2Copy) tl.to(s2Copy, { y: -18, opacity: 0, duration: 0.6 }, 's2-out');
    s2Arts.forEach((a, i) =>
      tl.to(a, { y: -22, opacity: 0, duration: 0.6 }, 's2-out+=' + i * 0.05)
    );

    tl.addLabel('s3', 1.65);
    tl.to(stages[2], { opacity: 1 }, 's3-=0.2');
    const s3Copy = stages[2].querySelector<HTMLElement>('.landmark__copy');
    const s3Arts = stages[2].querySelectorAll<HTMLElement>('.landmark__art');
    if (s3Copy) tl.to(s3Copy, { y: 0, opacity: 1, duration: 0.7 }, 's3-=0.15');
    s3Arts.forEach((a, i) =>
      tl.to(a, { y: 0, opacity: 1, duration: 0.7 }, 's3-=0.1+=' + i * 0.07)
    );

    tl.addLabel('s3-end', 2.4);
  }

  ScrollTrigger.refresh();
}

function setActiveDot(dots: HTMLElement[], activeIndex: number): void {
  dots.forEach((d, i) => {
    if (i === activeIndex) d.classList.add('is-active');
    else d.classList.remove('is-active');
  });
}

if (import.meta.hot) import.meta.hot.dispose(() => {});
