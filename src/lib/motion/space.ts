/**
 * SPACE motion module — two-state crossing.
 *
 * Single timeline, one transition, scrubbed by ScrollTrigger:
 *   s1 (sense)        image on right, evocative copy left
 *   s2 (structure)    image crosses left + dominates; sub-cats appear right
 *
 * The previous "s3 (information)" state — image receding to opacity 0.4 and
 * an info layer rendering on top — was rolled back at the user's request.
 * Now the image stays present; category swap happens via hover (handled in
 * Space.astro), not as a third pinned state.
 *
 * Snap labels: s1 / s2. Magnetic landing reads as a discrete settle, the
 * editorial register the brief frames the section in.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { shouldReduce } from './reduced-motion';
import type { MotionModule } from './types';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const spaceModule: MotionModule = {
  id: 'space',
  init(el, mode) {
    return gsap.context(() => {
      const reduce = shouldReduce();

      const monoLabel = el.querySelector<HTMLElement>('[data-reveal="mono"]');
      const display = el.querySelector<HTMLElement>('[data-reveal="display"]');
      const ko = el.querySelector<HTMLElement>('[data-reveal="ko"]');
      const image = el.querySelector<HTMLElement>('.space__image');
      const cats = el.querySelector<HTMLElement>('.space__cats');
      const copy = el.querySelector<HTMLElement>('.space__copy');

      // Copy entrance. No ScrollTrigger: section is lazy-imported via
      // IntersectionObserver(rootMargin:50%); a 'top 70%' trigger here
      // would miss its window on fast scroll, leaving from()-state stuck.
      const enter = gsap.timeline({ defaults: { ease: EASE } });
      const dy = reduce ? 0 : 18;
      if (monoLabel) enter.from(monoLabel, { y: dy, opacity: 0, duration: 0.6 }, 0);
      if (display) enter.from(display, { y: reduce ? 0 : 24, opacity: 0, duration: 0.86 }, 0.08);
      if (ko) enter.from(ko, { y: dy, opacity: 0, duration: 0.7 }, 0.32);

      if (reduce || mode === 'mobile') {
        // Stack states vertically (CSS handles layout via media queries).
        // Cats start at opacity 0 under desktop pin; force visible here.
        if (cats) gsap.set(cats, { opacity: 1, x: 0 });
        if (mode === 'mobile' && !reduce) {
          for (const block of [image, cats]) {
            if (!block) continue;
            gsap.from(block, {
              y: 24,
              opacity: 0,
              duration: 0.86,
              ease: EASE,
              scrollTrigger: { trigger: block, start: 'top 85%', once: true },
            });
          }
        }
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: '+=200%',
          anticipatePin: 1,
          invalidateOnRefresh: true,
          pinSpacing: true,
          snap: {
            snapTo: 'labels',
            duration: { min: 0.2, max: 0.9 },
            ease: 'power1.inOut',
            delay: 0,
          },
          onEnter: () => activate(el, [image, cats]),
          onEnterBack: () => activate(el, [image, cats]),
          onLeave: () => deactivate(el, [image, cats]),
          onLeaveBack: () => deactivate(el, [image, cats]),
        },
      });

      // Initial state.
      if (image) gsap.set(image, { x: 0, scale: 1, opacity: 1 });
      if (cats) gsap.set(cats, { opacity: 0, x: 40 });

      tl.addLabel('s1');

      // s1 → s2: image translates left + scales subtly; cats fade in;
      // copy shifts so it stays anchored as image overlaps it.
      tl.to(image, { x: '-22vw', scale: 1.04, duration: 1 }, 's1');
      tl.to(cats, { opacity: 1, x: 0, duration: 1 }, 's1');
      if (copy) tl.to(copy, { x: -16, opacity: 0.92, duration: 1 }, 's1');

      tl.addLabel('s2');

      ScrollTrigger.refresh(true);
    }, el);
  },
};

function activate(el: HTMLElement, layers: Array<HTMLElement | null>): void {
  el.style.contain = '';
  for (const l of layers) if (l) l.style.willChange = 'transform, opacity';
}

function deactivate(el: HTMLElement, layers: Array<HTMLElement | null>): void {
  el.style.contain = 'layout paint';
  for (const l of layers) if (l) l.style.willChange = '';
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    /* registry handles teardown */
  });
}
