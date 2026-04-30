/**
 * PROLOGUE / COAST — hero section.
 *
 * Mounts a single <video> element inside the centered editorial frame
 * (`[data-video-mount]`) after window.load — the static <Picture> poster
 * remains the LCP candidate. The video element cycles through
 * COAST-01 → COAST-02 → COAST-03 → COAST-01 (loop) by swapping its `src`
 * on the `ended` event, so the three clips play in sequence in a single
 * decoder pipeline (cheaper than three stacked elements).
 *
 * Reduced-motion: video never mounts; the poster is the entire hero.
 */

import { getVideo } from '../asset';
import { shouldReduce } from './reduced-motion';
import type { VideoSlotId } from '../../data/asset-manifest';
import type { Mode } from './types';

const SEQUENCE: readonly VideoSlotId[] = ['COAST-01', 'COAST-02', 'COAST-03'];

const cleanups = new WeakMap<HTMLElement, Array<() => void>>();

export function setup(el: HTMLElement, _mode: Mode): void {
  const reduce = shouldReduce();
  const prior = cleanups.get(el);
  if (prior) for (const fn of prior) try { fn(); } catch { /* ignore */ }
  const list: Array<() => void> = [];
  cleanups.set(el, list);

  if (reduce) return;
  const videoMount = el.querySelector<HTMLElement>('[data-video-mount]');
  if (!videoMount) return;

  const mount = () => mountSequence(videoMount, list);
  if (document.readyState === 'complete') mount();
  else {
    const onLoad = () => mount();
    window.addEventListener('load', onLoad, { once: true });
    list.push(() => window.removeEventListener('load', onLoad));
  }
}

function mountSequence(mount: HTMLElement, list: Array<() => void>): void {
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  video.preload = 'auto';
  video.setAttribute('aria-hidden', 'true');
  video.setAttribute('tabindex', '-1');
  video.id = 'coast-hero-video';

  let index = 0;

  const loadAt = (i: number) => {
    const spec = getVideo(SEQUENCE[i]);
    // Single-source-per-clip is enough for these MP4s. Clear children
    // first so a previous clip's <source> doesn't linger.
    while (video.firstChild) video.removeChild(video.firstChild);
    for (const src of spec.sources) {
      const source = document.createElement('source');
      source.src = src.src;
      source.type = src.type;
      video.appendChild(source);
    }
    video.load();
  };

  const advance = () => {
    index = (index + 1) % SEQUENCE.length;
    loadAt(index);
    void video.play().catch(() => { /* autoplay blocked — leave on poster */ });
  };

  const onPlaying = () => {
    video.dataset.playing = 'true';
  };
  const onEnded = () => {
    advance();
  };

  video.addEventListener('playing', onPlaying);
  video.addEventListener('ended', onEnded);

  loadAt(0);
  mount.appendChild(video);
  void video.play().catch(() => { /* autoplay blocked — leave on poster */ });

  list.push(() => {
    video.removeEventListener('playing', onPlaying);
    video.removeEventListener('ended', onEnded);
    video.pause();
    while (video.firstChild) video.removeChild(video.firstChild);
    video.removeAttribute('src');
    video.load();
    video.remove();
  });
}

if (import.meta.hot) import.meta.hot.dispose(() => { /* no-op */ });
