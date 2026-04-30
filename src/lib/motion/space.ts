/**
 * SPACE — entrance reveal + (in hijack mode) horizontal-slide category gallery.
 *
 * Hijack mode: each category becomes its own stage. Advance shifts the
 * active category and slides the photo mask horizontally (outgoing slides
 * out one way, incoming slides in from the opposite side). Cat labels'
 * data-active mirrors the controller index.
 *
 * Non-hijack mode: hover-driven cross-fade (handled by Space.astro inline
 * script); this module only kicks the section's entrance reveal.
 */

import { gsap } from 'gsap';

import { SPACE_CATEGORIES } from '../../data/space-content';
import { isHijackActive } from './hijack-mode';
import { register as registerController } from './hijack-registry';
import { shouldReduce } from './reduced-motion';
import { jumpToStage } from './scroll-hijack';
import type { Mode } from './types';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_SLIDE = 'power3.inOut';
// SLIDE_FROM — entrance starting offset for the photo mask, layered on top
// of the CSS `transform: translate(-50%, -50%)` centering. GSAP composes
// `x` translation with the parsed CSS xPercent/yPercent baseline, so when
// `x` returns to 0 the mask settles at viewport center. 50vw places the
// mask near the right edge so the slide-to-center reads clearly.
const SLIDE_FROM = '50vw';
// HIJACK_REVEAL_DELAY — wait for the section-to-section stack transition
// (TRANSITION_IN ≈ 1.35s in scroll-hijack.ts) to mostly settle before the
// mask begins sliding in, so the move is visible after arrival rather
// than buried under the section rise.
const HIJACK_REVEAL_DELAY = 0.85;
const ADVANCE_DURATION = 1.2;

export function setup(el: HTMLElement, _mode: Mode): void {
  const reduce = shouldReduce();
  const monoLabel = el.querySelector<HTMLElement>('[data-reveal="mono"]');
  const display = el.querySelector<HTMLElement>('[data-reveal="display"]');
  const ko = el.querySelector<HTMLElement>('[data-reveal="ko"]');
  const image = el.querySelector<HTMLElement>('.space__image');
  const cats = el.querySelector<HTMLElement>('.space__cats');

  if (!reduce) {
    if (image) gsap.set(image, { x: SLIDE_FROM, opacity: 0 });
    if (monoLabel) gsap.set(monoLabel, { y: 16, opacity: 0 });
    if (display) gsap.set(display, { y: 24, opacity: 0 });
    if (ko) gsap.set(ko, { y: 16, opacity: 0 });
    if (cats) gsap.set(cats, { x: 32, opacity: 0 });
  }

  let played = false;
  const playEntrance = (delay = 0) => {
    if (played) return;
    played = true;
    const tl = gsap.timeline({ delay, defaults: { ease: EASE } });
    if (reduce) {
      tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0);
      return;
    }
    // Photo mask slides from the right (`x` ≈ +50vw) into the centered
    // resting position. `x` composes additively over the CSS-derived
    // translate(-50%, -50%) baseline, so x:0 lands at viewport center.
    if (image) tl.to(image, { x: 0, opacity: 1, duration: 1.4 }, 0);
    if (monoLabel) tl.to(monoLabel, { y: 0, opacity: 1, duration: 0.6 }, 0.25);
    if (display) tl.to(display, { y: 0, opacity: 1, duration: 0.86 }, 0.4);
    if (ko) tl.to(ko, { y: 0, opacity: 1, duration: 0.7 }, 0.55);
    if (cats) tl.to(cats, { x: 0, opacity: 1, duration: 0.86 }, 0.65);
  };

  if (isHijackActive() && !reduce) {
    setupHijack(el, playEntrance);
    return;
  }

  // Non-hijack: IO-driven entrance reveal.
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.intersectionRatio > 0.3) {
          io.disconnect();
          playEntrance();
          return;
        }
      }
    },
    { threshold: [0, 0.15, 0.3, 0.5] }
  );
  io.observe(el);
}

/** Hijack-mode controller — wheel advance switches between categories, the
 *  photo mask slides horizontally, and the display heading swaps to that
 *  category's copy. Clicking a category in the list jumps directly. */
function setupHijack(el: HTMLElement, playEntrance: (delay?: number) => void): void {
  const cats = Array.from(el.querySelectorAll<HTMLElement>('.space__cat'));
  const images = Array.from(el.querySelectorAll<HTMLElement>('[data-cat-image]'));
  const displayEl = el.querySelector<HTMLElement>('[data-space-display]');
  const displayKoEl = el.querySelector<HTMLElement>('[data-space-display-ko]');
  if (cats.length === 0 || images.length === 0) return;

  // Pre-position images: first one centered, rest off-screen right.
  images.forEach((img, i) => {
    if (i === 0) gsap.set(img, { xPercent: 0, opacity: 1 });
    else gsap.set(img, { xPercent: 100, opacity: 0 });
  });

  let currentIndex = 0;

  const setDataActive = (idx: number) => {
    cats.forEach((c, i) => {
      c.dataset.active = i === idx ? 'true' : 'false';
    });
    images.forEach((im, i) => {
      im.dataset.active = i === idx ? 'true' : 'false';
    });
  };

  // Render newline-aware display text. Source is the static
  // SPACE_CATEGORIES data file (no user input), so a small innerHTML
  // build with <br> between lines is safe.
  const renderDisplay = (idx: number) => {
    const cat = SPACE_CATEGORIES[idx];
    if (!cat) return;
    if (displayEl) {
      const lines = cat.display.split('\n');
      displayEl.innerHTML = lines
        .map((line) => escapeHtml(line))
        .join('<br />');
    }
    if (displayKoEl) {
      displayKoEl.textContent = cat.displayKo;
    }
  };

  // Cross-fade swap so the text-change isn't a hard cut.
  const swapDisplay = (idx: number) => {
    const targets: HTMLElement[] = [];
    if (displayEl) targets.push(displayEl);
    if (displayKoEl) targets.push(displayKoEl);
    if (targets.length === 0) {
      renderDisplay(idx);
      return;
    }
    gsap.killTweensOf(targets);
    gsap.to(targets, {
      opacity: 0,
      y: -8,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        renderDisplay(idx);
        gsap.fromTo(
          targets,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.6, ease: EASE }
        );
      },
    });
  };

  registerController('space', {
    totalStages: cats.length,
    advance: (toIndex: number) => {
      const clamped = Math.max(0, Math.min(cats.length - 1, toIndex));
      if (clamped === currentIndex) return;
      const dir: 1 | -1 = clamped > currentIndex ? 1 : -1;
      const out = images[currentIndex];
      const inc = images[clamped];

      // Stack any previous slide-tween so the next one starts clean.
      gsap.killTweensOf([out, inc]);

      // Pre-position incoming on the side it'll slide in from.
      gsap.set(inc, { xPercent: dir > 0 ? 100 : -100, opacity: 1 });
      // Outgoing slides out the opposite side.
      gsap.to(out, {
        xPercent: dir > 0 ? -100 : 100,
        opacity: 0,
        duration: ADVANCE_DURATION,
        ease: EASE_SLIDE,
      });
      gsap.to(inc, {
        xPercent: 0,
        opacity: 1,
        duration: ADVANCE_DURATION,
        ease: EASE_SLIDE,
      });

      currentIndex = clamped;
      setDataActive(clamped);
      swapDisplay(clamped);
    },
    reveal: () => {
      // Delay the mask slide so it begins after the section-to-section
      // stack transition has mostly settled — otherwise the slide hides
      // beneath the section rise and reads as "already centered".
      playEntrance(HIJACK_REVEAL_DELAY);
    },
  });

  // Clicking a category in the list jumps to its sub-stage. Routes
  // through scroll-hijack so the global currentStageIndex stays in sync
  // (otherwise the next wheel input would advance from a stale index).
  cats.forEach((cat, i) => {
    cat.addEventListener('click', () => {
      if (i === currentIndex) return;
      jumpToStage('space', i);
    });
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

if (import.meta.hot) import.meta.hot.dispose(() => {});
