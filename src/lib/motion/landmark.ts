/**
 * LANDMARK motion module — vertical rise (Stage 1) + single horizontal
 * decomposition event (Stage 2). One ScrollTrigger pin, one scrubbed
 * timeline carrying both stages so the transition reads as one event,
 * not a slide change.
 *
 * Vestibular safety: scale capped at 1.03 (per WCAG 2.3.3 guidance).
 * Layer discipline: will-change toggled on enter/leave only; contain
 * layout paint removed when active.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { shouldReduce } from './reduced-motion';
import type { MotionModule } from './types';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const landmarkModule: MotionModule = {
  id: 'landmark',
  init(el, _mode) {
    return gsap.context(() => {
      const reduce = shouldReduce();

      const tower = el.querySelector<HTMLElement>('.landmark__tower');
      const towerImg = el.querySelector<HTMLImageElement>('.landmark__tower img');
      const detail = el.querySelector<HTMLElement>('.landmark__detail');
      const caption = el.querySelector<HTMLElement>('.landmark__caption');
      const copy = el.querySelector<HTMLElement>('.landmark__copy');
      const monoLabel = el.querySelector<HTMLElement>('[data-reveal="mono"]');
      const display = el.querySelector<HTMLElement>('[data-reveal="display"]');
      const ko = el.querySelector<HTMLElement>('[data-reveal="ko"]');

      // ---- Copy reveal (entrance) ----
      const enter = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: el, start: 'top 70%', once: true },
      });
      const dy = reduce ? 0 : 18;
      if (monoLabel) enter.from(monoLabel, { y: dy, opacity: 0, duration: 0.6 }, 0);
      if (display) enter.from(display, { y: reduce ? 0 : 24, opacity: 0, duration: 0.86 }, 0.08);
      if (ko) enter.from(ko, { y: dy, opacity: 0, duration: 0.7 }, 0.32);

      if (reduce) return; // static stacked layout via @media-reduced CSS

      // ---- Pinned scrub: Stage 1 + Stage 2 ----
      const pin = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          pin: true,
          scrub: 0.6,
          start: 'top top',
          end: '+=200%', // matches --pin-landmark
          anticipatePin: 1,
          invalidateOnRefresh: true,
          pinSpacing: true,
          onEnter: () => activate(el, tower, detail),
          onEnterBack: () => activate(el, tower, detail),
          onLeave: () => deactivate(el, tower, detail),
          onLeaveBack: () => deactivate(el, tower, detail),
        },
      });

      // Stage 1 (0 → 0.6): camera tilt up — object-position moves from bottom to top.
      if (towerImg) {
        pin.to(
          towerImg,
          { objectPosition: 'center top', duration: 0.6 },
          0
        );
      }

      // Stage 2 (0.6 → 1.0): tower translates left, facade enters from right.
      if (tower) {
        pin.to(tower, { xPercent: -15, scale: 1.03, duration: 0.4 }, 0.6);
      }
      if (detail) {
        gsap.set(detail, { xPercent: 12 });
        pin.to(detail, { xPercent: 0, opacity: 1, duration: 0.4 }, 0.6);
      }
      if (caption) {
        pin.to(caption, { opacity: 1, duration: 0.3 }, 0.78);
      }

      // Tiny copy parallax during pin (subtle, NOT theatric).
      if (copy) {
        pin.to(copy, { yPercent: -6, duration: 1 }, 0);
      }

      // Force initial layout offsets to recompute after pin construction.
      ScrollTrigger.refresh(true);
    }, el);
  },
};

function activate(el: HTMLElement, tower: HTMLElement | null, detail: HTMLElement | null): void {
  el.style.contain = '';
  if (tower) tower.style.willChange = 'transform';
  if (detail) detail.style.willChange = 'transform, opacity';
}

function deactivate(el: HTMLElement, tower: HTMLElement | null, detail: HTMLElement | null): void {
  el.style.contain = 'layout paint';
  if (tower) tower.style.willChange = '';
  if (detail) detail.style.willChange = '';
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    /* registry handles atomic teardown on next module register */
  });
}
