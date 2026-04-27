/**
 * bfcache lifecycle handlers.
 *
 * Lenis's rAF loop and an autoplaying hero video can disqualify the page
 * from bfcache. We bind:
 *   • `pagehide`  → stop the engine so back/forward navigation can suspend.
 *   • `pageshow` (event.persisted) → ScrollTrigger.refresh() + engine.start()
 *     so layout/pin offsets re-sync to whatever scroll position the browser
 *     restored.
 *
 * Source: web.dev bfcache best practices.
 */

import { ScrollTrigger } from 'gsap/ScrollTrigger';

export interface BfcacheHooks {
  stop(): void;
  start(): void;
}

export function bindBfcache({ stop, start }: BfcacheHooks): () => void {
  const onHide = () => stop();
  const onShow = (event: PageTransitionEvent) => {
    if (!event.persisted) return;
    ScrollTrigger.refresh(true);
    start();
  };

  window.addEventListener('pagehide', onHide);
  window.addEventListener('pageshow', onShow);

  return () => {
    window.removeEventListener('pagehide', onHide);
    window.removeEventListener('pageshow', onShow);
  };
}
