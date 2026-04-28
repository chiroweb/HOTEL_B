/**
 * PROLOGUE motion module.
 *
 * Boots the hero choreography after window.load so the poster (LCP element)
 * paints first. Reduced-motion + Save-Data path skips the <video> mount and
 * the scroll-driven horizon shift entirely — copy fades only.
 *
 * Cleanup: gsap.context.revert() kills tweens/triggers; manually-tracked
 * DOM listeners are flushed in the same call via a wrapped revert.
 */

import { gsap } from 'gsap';

import { getVideo } from '../asset';
import { shouldReduce } from './reduced-motion';
import type { MotionModule } from './types';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const prologueModule: MotionModule = {
  id: 'prologue',
  init(el, _mode) {
    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      const reduce = shouldReduce();

      const monoLabel = el.querySelector<HTMLElement>('[data-reveal="mono"]');
      const displayHeading = el.querySelector<HTMLElement>('[data-reveal="display"]');
      const koLine = el.querySelector<HTMLElement>('[data-reveal="ko"]');
      const pauseControlEl = el.querySelector<HTMLElement>('[data-reveal="pause"]');
      const frame = el.querySelector<HTMLElement>('.coast__frame');
      const videoMount = el.querySelector<HTMLElement>('[data-video-mount]');
      const pauseButton = el.querySelector<HTMLButtonElement>('[data-pause-control]');

      // ---- Reveal sequence (all elements; reduced-motion drops y drift) ----
      const reveal = gsap.timeline({ defaults: { ease: EASE } });
      const tweenOpts = reduce
        ? { y: 0, opacity: 0, duration: 0.5 }
        : { y: 16, opacity: 0, duration: 0.62 };
      const tweenOptsLg = reduce
        ? { y: 0, opacity: 0, duration: 0.6 }
        : { y: 24, opacity: 0, duration: 0.86 };
      if (monoLabel) reveal.from(monoLabel, tweenOpts, 0);
      if (frame) reveal.from(frame, { y: reduce ? 0 : 18, opacity: 0, duration: 0.95 }, 0.04);
      if (displayHeading) reveal.from(displayHeading, tweenOptsLg, 0.42);
      if (koLine) reveal.from(koLine, tweenOpts, 0.62);
      if (pauseControlEl) reveal.from(pauseControlEl, { opacity: 0, duration: 0.4 }, 0.78);

      // No scroll-driven scrub on the frame — it stays anchored as a
      // contained editorial window, not a parallax surface.

      // ---- Video mount (LCP-protective: ONLY after window.load) ----
      if (!reduce && videoMount) {
        const mount = () => mountVideo(videoMount, pauseButton, cleanups);
        if (document.readyState === 'complete') {
          mount();
        } else {
          const onLoad = () => mount();
          window.addEventListener('load', onLoad, { once: true });
          cleanups.push(() => window.removeEventListener('load', onLoad));
        }
      }
    }, el);

    // Wrap revert so DOM listeners and dynamically-mounted nodes flush
    // in the same teardown call as gsap-created animations.
    const originalRevert = ctx.revert.bind(ctx);
    ctx.revert = ((...args: Parameters<typeof originalRevert>) => {
      while (cleanups.length) {
        try {
          cleanups.pop()?.();
        } catch (err) {
          console.error('[prologue] cleanup failed:', err);
        }
      }
      return originalRevert(...args);
    }) as typeof ctx.revert;

    return ctx;
  },
};

// ---------------------------------------------------------------------------
// Video mount + WCAG 2.2.2 pause control wiring.
// ---------------------------------------------------------------------------

function mountVideo(
  mount: HTMLElement,
  pauseButton: HTMLButtonElement | null,
  cleanups: Array<() => void>
): void {
  const spec = getVideo('PROLOGUE-01');

  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.autoplay = true;
  video.preload = 'metadata';
  video.setAttribute('aria-hidden', 'true');
  video.setAttribute('tabindex', '-1');
  video.id = 'coast-hero-video';

  for (const src of spec.sources) {
    const source = document.createElement('source');
    source.src = src.src;
    source.type = src.type;
    video.appendChild(source);
  }

  const onPlaying = () => {
    video.style.opacity = '1';
  };
  video.addEventListener('playing', onPlaying, { once: true });

  mount.appendChild(video);
  void video.play().catch(() => {
    /* autoplay rejected — poster remains; user can press PLAY (control still wires). */
  });

  cleanups.push(() => {
    video.removeEventListener('playing', onPlaying);
    video.pause();
    video.removeAttribute('src');
    while (video.firstChild) video.removeChild(video.firstChild);
    video.load();
    video.remove();
  });

  if (!pauseButton) return;

  const pauseLabel = pauseButton.querySelector<HTMLElement>('[data-pause-label]');

  const setUiState = (paused: boolean) => {
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.setAttribute(
      'aria-label',
      paused ? 'Play hero video' : 'Pause hero video'
    );
    if (pauseLabel) pauseLabel.textContent = paused ? 'PLAY' : 'PAUSE';
  };

  const onClick = () => {
    if (video.paused) {
      void video.play();
      setUiState(false);
    } else {
      video.pause();
      setUiState(true);
    }
  };

  const onVideoPlay = () => setUiState(false);
  const onVideoPause = () => setUiState(true);

  pauseButton.addEventListener('click', onClick);
  video.addEventListener('play', onVideoPlay);
  video.addEventListener('pause', onVideoPause);

  setUiState(video.paused);

  cleanups.push(() => {
    pauseButton.removeEventListener('click', onClick);
    video.removeEventListener('play', onVideoPlay);
    video.removeEventListener('pause', onVideoPause);
  });
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    // Per-module HMR cleanup hook (registry handles the actual revert when
    // the parent registers a fresh module on the next reload).
  });
}
