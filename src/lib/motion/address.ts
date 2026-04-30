/**
 * ADDRESS — entrance reveal + (in hijack mode) a second sub-stage that
 * lifts the layout and slides the footer panel up from below.
 *
 * Defensive default: setup() does NOT pre-hide the address content. The
 * elements stay visible until the animation actually fires. play() uses
 * `gsap.fromTo` so the hidden initial state is only applied at the
 * moment the animation begins. If reveal never fires for any reason
 * (e.g., HMR error in another module, controller register race), the
 * address still reads as a static editorial composition rather than a
 * blank screen.
 *
 * Hijack mode: registers as a 2-stage controller. subIndex 0 = imprint,
 * subIndex 1 lifts the layout and reveals the footer.
 *
 * Non-hijack mode: IO-driven entrance only.
 */

import { gsap } from 'gsap';

import { isHijackActive } from './hijack-mode';
import { register as registerController } from './hijack-registry';
import { shouldReduce } from './reduced-motion';
import type { Mode } from './types';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const SLIDE = 120;
const POSTER_LIFT_VH = 14;

export function setup(el: HTMLElement, _mode: Mode): void {
  const reduce = shouldReduce();
  const lines = el.querySelectorAll<HTMLElement>('.address__display span');
  const ko = el.querySelector<HTMLElement>('.address__display-ko');
  const lede = el.querySelector<HTMLElement>('.address__lede');
  const plate = el.querySelector<HTMLElement>('.address__plate');
  const monoLabel = el.querySelector<HTMLElement>('[data-reveal="mono"]');
  const layout = el.querySelector<HTMLElement>('.address__layout');
  const footer = el.querySelector<HTMLElement>('.site-footer');

  let played = false;
  const play = () => {
    if (played) return;
    played = true;
    const tl = gsap.timeline({ defaults: { ease: EASE } });
    if (reduce) {
      tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0);
      return;
    }
    if (monoLabel) {
      tl.fromTo(
        monoLabel,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        0
      );
    }
    if (lines.length > 0) {
      tl.fromTo(
        lines,
        { x: SLIDE, y: 24, opacity: 0 },
        { x: 0, y: 0, opacity: 1, duration: 1.1, stagger: 0.14 },
        0.05
      );
    }
    if (plate) {
      tl.fromTo(
        plate,
        { x: 36, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.0 },
        0.35
      );
    }
    if (ko) {
      tl.fromTo(
        ko,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        0.55
      );
    }
    if (lede) {
      tl.fromTo(
        lede,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 0.7, duration: 0.8 },
        0.85
      );
    }
  };

  if (isHijackActive() && !reduce) {
    registerController('address', {
      totalStages: 2,
      advance: (toIndex: number) => {
        const clamped = Math.max(0, Math.min(1, toIndex));
        if (clamped === 1) {
          if (layout) {
            gsap.to(layout, {
              y: `-${POSTER_LIFT_VH}vh`,
              duration: 1.1,
              ease: EASE,
              overwrite: 'auto',
            });
          }
          if (footer) footer.dataset.revealed = 'true';
        } else {
          if (layout) {
            gsap.to(layout, {
              y: 0,
              duration: 1.1,
              ease: EASE,
              overwrite: 'auto',
            });
          }
          if (footer) footer.dataset.revealed = 'false';
        }
      },
      reveal: () => {
        play();
      },
    });

    // Belt-and-suspenders: if for any reason reveal() doesn't fire by
    // the time the section becomes visible (controller race, HMR, etc),
    // an IntersectionObserver still triggers play() so content lands.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio > 0.2) {
            io.disconnect();
            play();
            return;
          }
        }
      },
      { threshold: [0, 0.1, 0.2, 0.4] }
    );
    io.observe(el);
    return;
  }

  // Non-hijack: IO-driven entrance only.
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.intersectionRatio > 0.25) {
          io.disconnect();
          play();
          return;
        }
      }
    },
    { threshold: [0, 0.15, 0.25, 0.4] }
  );
  io.observe(el);
}

if (import.meta.hot) import.meta.hot.dispose(() => { /* no-op */ });
