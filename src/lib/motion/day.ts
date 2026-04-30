/**
 * DAY — horizontal-track section.
 *
 * Desktop: pin the section for ~3 viewport-heights of vertical scroll;
 * during the pin, translate the inner .day-stack horizontally so the
 * 4 frames pass left-to-right. Each frame's photo / float / copy
 * fades in with a small offset as that frame becomes the centered one.
 *
 * Mobile + reduced-motion: skip pin entirely. CSS collapses .day-stack
 * to a vertical column; entrance reveals fire on IntersectionObserver
 * threshold-based once.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { isHijackActive } from './hijack-mode';
import { register as registerController } from './hijack-registry';
import { shouldReduce } from './reduced-motion';
import type { Mode } from './types';

gsap.registerPlugin(ScrollTrigger);

const EASE_REVEAL = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_ADVANCE = 'power3.out';

export function setup(sectionEl: HTMLElement, mode: Mode): void {
  const reduce = shouldReduce();
  const frames = Array.from(sectionEl.querySelectorAll<HTMLElement>('.day-frame'));
  const stack = sectionEl.querySelector<HTMLElement>('.day-stack');

  // Pre-state for entrance reveals.
  for (const frame of frames) {
    setupFrameReveal(frame, reduce);
  }

  if (reduce || mode === 'mobile' || !stack) {
    // Vertical natural flow — entrance reveals fire as user scrolls.
    return;
  }

  if (isHijackActive()) {
    // Hijack mode: stack does not pin; scroll-hijack drives internal stage
    // changes by calling the registered advance() per wheel input.
    gsap.set(stack, { x: 0 });
    registerController('day', {
      totalStages: frames.length,
      advance: (toIndex: number) => {
        const clamped = Math.max(0, Math.min(frames.length - 1, toIndex));
        gsap.to(stack, {
          x: `-${clamped * 100}vw`,
          duration: 1.35,
          ease: EASE_ADVANCE,
        });
        // Trigger this frame's entrance reveal (idempotent — `played` flag
        // inside setupFrameReveal guards against re-runs).
        const target = frames[clamped];
        if (target) target.dispatchEvent(new CustomEvent('day-frame:activate'));
      },
      reveal: () => {
        const first = frames[0];
        if (first) first.dispatchEvent(new CustomEvent('day-frame:activate'));
      },
    });
    return;
  }

  // Horizontal pin track. Total scroll budget = (frames - 1) viewport widths.
  const totalScrollFraction = (frames.length - 1) * 100; // %

  gsap.to(stack, {
    x: () => `-${totalScrollFraction}vw`,
    ease: 'none',
    scrollTrigger: {
      trigger: sectionEl,
      pin: true,
      scrub: 0.6,
      start: 'top top',
      end: () => `+=${stack.scrollWidth - window.innerWidth}`,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  ScrollTrigger.refresh();
}

function setupFrameReveal(frame: HTMLElement, reduce: boolean): void {
  const bg = frame.querySelector<HTMLElement>('.day-frame__bg');
  const floatA = frame.querySelector<HTMLElement>('.day-frame__float--a');
  const floatB = frame.querySelector<HTMLElement>('.day-frame__float--b');
  const motif = frame.querySelector<HTMLElement>('.day-frame__motif');
  const copyKo = frame.querySelector<HTMLElement>('.day-frame__copy-ko');
  const copySub = frame.querySelector<HTMLElement>('.day-frame__copy-sub');
  const time = frame.querySelector<HTMLElement>('.day-frame__time');
  const label = frame.querySelector<HTMLElement>('.day-frame__label');

  if (!reduce) {
    if (bg) gsap.set(bg, { opacity: 0 });
    // Two floats per frame come in at clearly different tempos and from
    // slightly different directions, so they read as two separate beats
    // rather than a single mass.
    //   • floatA — snappy, near-vertical drop from upper-left
    //   • floatB — slower, drawn-out rise from lower-right
    if (floatA) gsap.set(floatA, { y: -22, x: -14, opacity: 0 });
    if (floatB) gsap.set(floatB, { y: 56, x: 22, opacity: 0 });
    if (time) gsap.set(time, { y: 14, opacity: 0 });
    if (label) gsap.set(label, { y: 22, opacity: 0 });
    if (motif) gsap.set(motif, { y: 14, opacity: 0 });
    if (copyKo) gsap.set(copyKo, { y: 18, opacity: 0 });
    if (copySub) gsap.set(copySub, { y: 14, opacity: 0 });
  }

  let played = false;
  const play = () => {
    if (played) return;
    played = true;
    const tl = gsap.timeline({ defaults: { ease: EASE_REVEAL } });
    if (reduce) {
      tl.fromTo(frame, { opacity: 0 }, { opacity: 1, duration: 0.7 }, 0);
      return;
    }
    if (bg) tl.to(bg, { opacity: 1, duration: 1.2 }, 0);
    // Different durations + different start times = visibly different
    // arrival speeds. Float A lands first and fast (≈0.85s), Float B
    // takes its time afterward (≈1.7s) so the second photo "hangs in"
    // after the first has already settled.
    if (floatA)
      tl.to(floatA, { x: 0, y: 0, opacity: 1, duration: 0.85 }, 0.2);
    if (floatB)
      tl.to(floatB, { x: 0, y: 0, opacity: 1, duration: 1.7 }, 0.55);
    if (time) tl.to(time, { y: 0, opacity: 1, duration: 0.55 }, 0.7);
    if (label) tl.to(label, { y: 0, opacity: 1, duration: 0.75 }, 0.85);
    if (motif) tl.to(motif, { y: 0, opacity: 0.65, duration: 0.6 }, 1.0);
    if (copyKo) tl.to(copyKo, { y: 0, opacity: 0.92, duration: 0.7 }, 1.15);
    if (copySub) tl.to(copySub, { y: 0, opacity: 0.88, duration: 0.7 }, 1.3);
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.intersectionRatio > 0.4) {
          io.disconnect();
          play();
          return;
        }
      }
    },
    { threshold: [0, 0.2, 0.4, 0.6] }
  );
  io.observe(frame);

  // Hijack mode: scroll-hijack dispatches this when the frame becomes the
  // current stage. `played` flag inside play() guards against duplicates.
  frame.addEventListener('day-frame:activate', () => {
    io.disconnect();
    play();
  });
}

if (import.meta.hot) import.meta.hot.dispose(() => {});
