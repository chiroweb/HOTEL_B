/**
 * DAY motion module — pinned horizontal time film.
 *
 * Canonical GSAP pinned-horizontal-track pattern:
 *   • Pin the OUTER section, animate the INNER track in pixels (NOT
 *     xPercent — variable frame widths break the percentage math).
 *   • `end` is a function so invalidateOnRefresh can recompute on font/
 *     image settle and resize.
 *   • anticipatePin: 1 hides flash-of-unpinned during fast scroll.
 *
 * Time-label cross-fade: a separate scrubbed timeline switches the
 * [data-active] attribute at progress thresholds 0 / 0.25 / 0.5 / 0.75
 * (CSS transitions handle the 280ms fade per --duration-time-label).
 *
 * Bottom progress hairline: 1px brass scaled 0 → 100% via the same
 * scrub progress.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { shouldReduce } from './reduced-motion';
import type { MotionModule } from './types';

export const dayModule: MotionModule = {
  id: 'day',
  init(el, mode) {
    return gsap.context(() => {
      const reduce = shouldReduce();

      const track = el.querySelector<HTMLElement>('.day-track');
      const labels = Array.from(el.querySelectorAll<HTMLElement>('.day-time-stack > .label-mono'));
      const progressFill = el.querySelector<HTMLElement>('.day-progress__fill');
      const frames = Array.from(el.querySelectorAll<HTMLElement>('.day-frame'));

      if (reduce || mode === 'mobile') {
        // Stacked vertical layout via @media-reduced/(max-width:768px) CSS.
        // Each frame fades in on scroll; meta-block time labels all visible.
        for (const label of labels) {
          label.dataset.reducedShow = 'true';
          label.dataset.active = 'false';
        }
        if (mode === 'mobile' && !reduce) {
          for (const frame of frames) {
            gsap.from(frame, {
              y: 28,
              opacity: 0,
              duration: 0.86,
              ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
              scrollTrigger: { trigger: frame, start: 'top 85%', once: true },
            });
          }
        }
        return;
      }

      if (!track) return;

      // Compute the horizontal travel distance lazily via function form so
      // invalidateOnRefresh recomputes on font/image settle and resize.
      const travel = () => track.scrollWidth - window.innerWidth;

      const scrub = gsap.to(track, {
        x: () => -travel(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: () => '+=' + travel(),
          anticipatePin: 1,
          invalidateOnRefresh: true,
          pinSpacing: true,
          onUpdate: ({ progress }) => {
            // Time-label state: 0..0.25 → 0, 0.25..0.5 → 1, 0.5..0.75 → 2, 0.75..1 → 3.
            const idx = Math.min(labels.length - 1, Math.floor(progress * labels.length));
            for (let i = 0; i < labels.length; i++) {
              labels[i].dataset.active = i === idx ? 'true' : 'false';
            }
            if (progressFill) {
              progressFill.style.width = `${(progress * 100).toFixed(2)}%`;
            }
          },
          onEnter: () => activate(el, track),
          onEnterBack: () => activate(el, track),
          onLeave: () => deactivate(el, track),
          onLeaveBack: () => deactivate(el, track),
        },
      });

      // Initial label state.
      if (labels[0]) labels[0].dataset.active = 'true';
      for (let i = 1; i < labels.length; i++) labels[i].dataset.active = 'false';

      void scrub;
      ScrollTrigger.refresh(true);
    }, el);
  },
};

function activate(el: HTMLElement, track: HTMLElement): void {
  el.style.contain = '';
  track.style.willChange = 'transform';
}

function deactivate(el: HTMLElement, track: HTMLElement): void {
  el.style.contain = 'layout paint';
  track.style.willChange = '';
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    /* registry handles teardown */
  });
}
