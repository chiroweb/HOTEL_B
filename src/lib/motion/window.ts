/**
 * WINDOW motion module — quietest section.
 *
 * Main interior image holds still (or scales max 1.02 over full pin
 * progress; vestibular cap per WCAG 2.3.3). Two floating frames drift
 * Y 16–32px and shift opacity scrub-driven across the pin. If the
 * motion is noticed explicitly, it's too loud.
 *
 * Layer discipline: will-change only on floating frames during pin.
 * Main image uses contain: paint until scrub starts (no early GPU
 * layer promotion).
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { shouldReduce } from './reduced-motion';
import type { MotionModule } from './types';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const windowModule: MotionModule = {
  id: 'window',
  init(el, mode) {
    return gsap.context(() => {
      const reduce = shouldReduce();

      const monoLabel = el.querySelector<HTMLElement>('[data-reveal="mono"]');
      const display = el.querySelector<HTMLElement>('[data-reveal="display"]');
      const ko = el.querySelector<HTMLElement>('[data-reveal="ko"]');
      const main = el.querySelector<HTMLImageElement>('.window__main img');
      const floatA = el.querySelector<HTMLElement>('.window__float--a');
      const floatB = el.querySelector<HTMLElement>('.window__float--b');

      // Copy reveal once on enter.
      // No ScrollTrigger: section module is lazy-imported via
      // IntersectionObserver(rootMargin:50%); a 'top 70%' trigger added here
      // would miss its window on fast scroll, leaving from()-state stuck.
      const enter = gsap.timeline({ defaults: { ease: EASE } });
      const dy = reduce ? 0 : 16;
      if (monoLabel) enter.from(monoLabel, { y: dy, opacity: 0, duration: 0.6 }, 0);
      if (display) enter.from(display, { y: reduce ? 0 : 22, opacity: 0, duration: 0.84 }, 0.08);
      if (ko) enter.from(ko, { y: dy, opacity: 0, duration: 0.7 }, 0.32);

      if (reduce) return;

      // Mobile: skip pin; floating frames stack and reveal sequentially.
      if (mode === 'mobile') {
        for (const f of [floatA, floatB]) {
          if (!f) continue;
          gsap.from(f, {
            y: 24,
            opacity: 0,
            duration: 0.86,
            ease: EASE,
            scrollTrigger: { trigger: f, start: 'top 88%', once: true },
          });
        }
        return;
      }

      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: '+=150%', // matches --pin-window
          anticipatePin: 1,
          invalidateOnRefresh: true,
          pinSpacing: true,
          onEnter: () => activate(el, [floatA, floatB]),
          onEnterBack: () => activate(el, [floatA, floatB]),
          onLeave: () => deactivate(el, [floatA, floatB]),
          onLeaveBack: () => deactivate(el, [floatA, floatB]),
        },
      });

      // Main image — extremely subtle scale (1.02 cap).
      if (main) {
        gsap.fromTo(
          main,
          { scale: 1 },
          {
            scale: 1.02,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top top',
              end: '+=150%',
              scrub: 1,
            },
          }
        );
      }

      // Floating frames — asymmetric Y drift + opacity.
      if (floatA) {
        gsap.fromTo(
          floatA,
          { y: 24, opacity: 0.0 },
          {
            y: -16,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              end: 'bottom 60%',
              scrub: 1,
            },
          }
        );
      }
      if (floatB) {
        gsap.fromTo(
          floatB,
          { y: -8, opacity: 0.0 },
          {
            y: 22,
            opacity: 0.92,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top 60%',
              end: 'bottom 50%',
              scrub: 1,
            },
          }
        );
      }

      ScrollTrigger.refresh(true);
    }, el);
  },
};

function activate(el: HTMLElement, floats: Array<HTMLElement | null>): void {
  el.style.contain = '';
  for (const f of floats) if (f) f.style.willChange = 'transform, opacity';
}

function deactivate(el: HTMLElement, floats: Array<HTMLElement | null>): void {
  el.style.contain = 'layout paint';
  for (const f of floats) if (f) f.style.willChange = '';
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    /* registry handles teardown */
  });
}
