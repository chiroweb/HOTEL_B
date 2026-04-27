/**
 * ADDRESS motion module — entrance fade only. After the stagger lands,
 * the section is still. No scroll-driven choreography.
 */

import { gsap } from 'gsap';

import { shouldReduce } from './reduced-motion';
import type { MotionModule } from './types';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const addressModule: MotionModule = {
  id: 'address',
  init(el, _mode) {
    return gsap.context(() => {
      const reduce = shouldReduce();

      const lines = el.querySelectorAll<HTMLElement>('.address__display span');
      const hairline = el.querySelector<HTMLElement>('.address__hairline');
      const metadata = el.querySelector<HTMLElement>('.address__metadata');
      const monoLabel = el.querySelector<HTMLElement>('[data-reveal="mono"]');

      const tl = gsap.timeline({
        defaults: { ease: EASE },
        scrollTrigger: { trigger: el, start: 'top 65%', once: true },
      });

      const dy = reduce ? 0 : 24;
      const lineDuration = reduce ? 0.4 : 1.1;
      const stagger = reduce ? 0 : 0.18;

      if (monoLabel) {
        tl.from(monoLabel, { y: reduce ? 0 : 16, opacity: 0, duration: 0.6 }, 0);
      }

      if (lines.length > 0) {
        tl.fromTo(
          lines,
          { y: dy, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: lineDuration,
            stagger,
            ease: EASE,
          },
          0.05
        );
      }

      if (hairline) {
        tl.to(hairline, { opacity: 1, duration: 0.6 }, '-=0.5');
      }

      if (metadata) {
        tl.to(metadata, { opacity: 0.92, duration: 0.7 }, '-=0.3');
      }
    }, el);
  },
};

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    /* registry handles teardown */
  });
}
