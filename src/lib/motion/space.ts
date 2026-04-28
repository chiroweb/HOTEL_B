/**
 * SPACE motion module — three-state crossing.
 *
 * Single timeline, two transitions, scrubbed by ScrollTrigger:
 *   s1 (sense)        image on right, evocative copy left
 *   s2 (structure)    image crosses left + dominates; sub-cats appear right
 *   s3 (information)  image recedes (opacity 0.4); info layer renders
 *
 * Decision: snap.snapTo: 'labels' (magnetic state landing). The brief
 * frames the metamorphosis as discrete settling positions ("sense →
 * structure → information"), so labels feel correct here. Switch to
 * continuous scrub if visual review prefers stop-frame edit feel.
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
      const info = el.querySelector<HTMLElement>('.space__info');
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
        // Render all three states stacked vertically (CSS handles layout via
        // (max-width:768px) and prefers-reduced-motion media). Ensure cats
        // and info are visible — under desktop pin they start at opacity 0.
        if (cats) gsap.set(cats, { opacity: 1, x: 0 });
        if (info) gsap.set(info, { opacity: 1 });
        if (mode === 'mobile' && !reduce) {
          // Stagger fade-in for each block.
          for (const block of [image, cats, info]) {
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
          end: '+=300%', // matches --pin-space
          anticipatePin: 1,
          invalidateOnRefresh: true,
          pinSpacing: true,
          snap: {
            snapTo: 'labels',
            duration: { min: 0.2, max: 0.9 },
            ease: 'power1.inOut',
            delay: 0,
          },
          onEnter: () => activate(el, [image, cats, info]),
          onEnterBack: () => activate(el, [image, cats, info]),
          onLeave: () => deactivate(el, [image, cats, info]),
          onLeaveBack: () => deactivate(el, [image, cats, info]),
        },
      });

      // Initial state.
      if (image) gsap.set(image, { x: 0, scale: 1, opacity: 1 });
      if (cats) gsap.set(cats, { opacity: 0, x: 40 });
      if (info) gsap.set(info, { opacity: 0 });

      tl.addLabel('s1');

      // s1 → s2: image translates left + scales toward dominant; cats fade in;
      // copy shifts subtly so it stays anchored as image overlaps it.
      tl.to(image, { x: '-22vw', scale: 1.04, duration: 1 }, 's1');
      tl.to(cats, { opacity: 1, x: 0, duration: 1 }, 's1');
      if (copy) tl.to(copy, { x: -16, opacity: 0.9, duration: 1 }, 's1');

      tl.addLabel('s2');

      // s2 → s3: image opacity fades to 0.4 and recedes; cats fade out as info appears.
      tl.to(image, { opacity: 0.4, scale: 1.0, duration: 1 }, 's2');
      tl.to(cats, { opacity: 0, x: 24, duration: 1 }, 's2');
      tl.to(info, { opacity: 1, duration: 1 }, 's2');
      if (copy) tl.to(copy, { opacity: 0.55, duration: 1 }, 's2');

      tl.addLabel('s3');

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
