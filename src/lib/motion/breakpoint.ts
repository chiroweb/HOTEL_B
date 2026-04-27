/**
 * Desktop / mobile breakpoint listener.
 *
 * Single source of truth for what counts as "mobile choreography" (≤768px).
 * Motion modules branch on the active mode; the engine restarts modules
 * when the breakpoint flips so each one rebuilds its desktop or mobile
 * timeline cleanly via `gsap.context().revert()`.
 */

import type { Mode } from './types';

const QUERY = '(min-width: 769px)';

export function currentMode(): Mode {
  if (typeof window === 'undefined') return 'desktop';
  return window.matchMedia(QUERY).matches ? 'desktop' : 'mobile';
}

export function onBreakpointChange(listener: (mode: Mode) => void): () => void {
  const mq = window.matchMedia(QUERY);
  const handler = () => listener(mq.matches ? 'desktop' : 'mobile');
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}
