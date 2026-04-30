/**
 * WINDOW — entrance reveal via IntersectionObserver.
 */

import { gsap } from 'gsap';

import { shouldReduce } from './reduced-motion';
import type { Mode } from './types';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const SLIDE = 120;

export function setup(el: HTMLElement, _mode: Mode): void {
  const reduce = shouldReduce();
  const monoLabel = el.querySelector<HTMLElement>('[data-reveal="mono"]');
  const display = el.querySelector<HTMLElement>('[data-reveal="display"]');
  const ko = el.querySelector<HTMLElement>('[data-reveal="ko"]');
  const main = el.querySelector<HTMLElement>('.window__main');
  const floatA = el.querySelector<HTMLElement>('.window__float--a');
  const floatB = el.querySelector<HTMLElement>('.window__float--b');

  if (!reduce) {
    if (main) gsap.set(main, { x: SLIDE, scale: 1.04, opacity: 0 });
    if (monoLabel) gsap.set(monoLabel, { y: 16, opacity: 0 });
    if (display) gsap.set(display, { y: 22, opacity: 0 });
    if (ko) gsap.set(ko, { y: 16, opacity: 0 });
    if (floatA) gsap.set(floatA, { y: 32, opacity: 0 });
    if (floatB) gsap.set(floatB, { y: 32, opacity: 0 });
  }

  let played = false;
  const play = () => {
    if (played) return;
    played = true;
    const tl = gsap.timeline({ defaults: { ease: EASE } });
    if (reduce) {
      tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0);
      return;
    }
    if (main) tl.to(main, { x: 0, scale: 1, opacity: 1, duration: 1.1 }, 0);
    if (monoLabel) tl.to(monoLabel, { y: 0, opacity: 1, duration: 0.6 }, 0.15);
    if (display) tl.to(display, { y: 0, opacity: 1, duration: 0.84 }, 0.25);
    if (ko) tl.to(ko, { y: 0, opacity: 1, duration: 0.7 }, 0.4);
    if (floatA) tl.to(floatA, { y: 0, opacity: 1, duration: 0.86 }, 0.45);
    if (floatB) tl.to(floatB, { y: 0, opacity: 1, duration: 0.86 }, 0.6);
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.intersectionRatio > 0.3) {
          io.disconnect();
          play();
          return;
        }
      }
    },
    { threshold: [0, 0.15, 0.3, 0.5] }
  );
  io.observe(el);
}

if (import.meta.hot) import.meta.hot.dispose(() => {});
