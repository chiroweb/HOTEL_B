/**
 * LANDMARK motion module — single-image architectural spread with
 * sequential annotation reveal.
 *
 * Choreography:
 *   1. Entrance reveal (outside the pin; once: true): mono index +
 *      display + KR copy fade in as the section approaches viewport.
 *   2. Pin scrub (200svh): three annotations toggle [data-state] from
 *      'hidden' → 'visible' at progress thresholds 0.20 / 0.45 / 0.70.
 *      The image itself stays static — no scale, no parallax. Each
 *      annotation's CSS transition (480ms editorial) handles the
 *      hairline draw and label fade independently.
 *
 * Mobile (mode='mobile'): pin not constructed; only the entrance
 * reveal runs. Annotations are display:none via CSS so no toggle work
 * is needed.
 *
 * Reduced-motion: pin not constructed; entrance reveal runs flat (no
 * y drift). CSS sets annotations to the visible state by default
 * under the reduce media query.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { shouldReduce } from './reduced-motion';
import type { MotionModule } from './types';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const ANNOTATION_THRESHOLDS = [0.2, 0.45, 0.7] as const;

export const landmarkModule: MotionModule = {
  id: 'landmark',
  init(el, mode) {
    return gsap.context(() => {
      const reduce = shouldReduce();

      const monoLabel = el.querySelector<HTMLElement>('[data-reveal="mono"]');
      const displayHeading = el.querySelector<HTMLElement>('[data-reveal="display"]');
      const koLine = el.querySelector<HTMLElement>('[data-reveal="ko"]');
      const frame = el.querySelector<HTMLElement>('.landmark__frame');
      const annotations = Array.from(
        el.querySelectorAll<HTMLElement>('[data-annotation]')
      );

      // ---- Entrance reveal (always runs, outside the pin) ----
      const enter = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: el, start: 'top 70%', once: true },
      });
      const dy = reduce ? 0 : 18;
      if (monoLabel) enter.from(monoLabel, { y: dy, opacity: 0, duration: 0.6 }, 0);
      if (frame) enter.from(frame, { y: reduce ? 0 : 22, opacity: 0, duration: 0.95 }, 0.04);
      if (displayHeading)
        enter.from(displayHeading, { y: reduce ? 0 : 24, opacity: 0, duration: 0.86 }, 0.42);
      if (koLine) enter.from(koLine, { y: dy, opacity: 0, duration: 0.7 }, 0.62);

      // Mobile + reduced-motion: skip pin entirely.
      // Annotations either hidden (mobile) or visible-by-default (reduce)
      // via CSS — no toggle needed here.
      if (reduce || mode === 'mobile') return;

      if (annotations.length === 0) return;

      // ---- Pin scrub: sequential annotation reveal ----
      // Reset annotations to hidden in case of HMR mid-scroll restart.
      for (const a of annotations) a.dataset.state = 'hidden';

      let activeIndex = -1;

      gsap.to(el, {
        scrollTrigger: {
          trigger: el,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: '+=200%', // matches --pin-landmark
          anticipatePin: 1,
          invalidateOnRefresh: true,
          pinSpacing: true,
          onEnter: () => activate(el, annotations),
          onEnterBack: () => activate(el, annotations),
          onLeave: () => deactivate(el, annotations),
          onLeaveBack: () => deactivate(el, annotations),
          onUpdate: ({ progress }) => {
            // Largest threshold index that progress has crossed.
            // -1 means none yet (all hidden).
            let next = -1;
            for (let i = 0; i < ANNOTATION_THRESHOLDS.length; i++) {
              if (progress >= ANNOTATION_THRESHOLDS[i]) next = i;
            }
            if (next === activeIndex) return;
            activeIndex = next;
            for (let i = 0; i < annotations.length; i++) {
              annotations[i].dataset.state = i <= next ? 'visible' : 'hidden';
            }
          },
        },
      });

      ScrollTrigger.refresh(true);
    }, el);
  },
};

function activate(el: HTMLElement, annotations: HTMLElement[]): void {
  el.style.contain = '';
  for (const a of annotations) {
    const hairline = a.querySelector<HTMLElement>('[data-hairline]');
    if (hairline) hairline.style.willChange = 'transform';
  }
}

function deactivate(el: HTMLElement, annotations: HTMLElement[]): void {
  el.style.contain = 'layout paint';
  for (const a of annotations) {
    const hairline = a.querySelector<HTMLElement>('[data-hairline]');
    if (hairline) hairline.style.willChange = '';
  }
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    /* registry handles teardown on next module register */
  });
}
