/**
 * Shared motion-system types.
 */

import { gsap } from 'gsap';

export type GsapContext = ReturnType<typeof gsap.context>;

export type Mode = 'desktop' | 'mobile';

/**
 * Per-section motion module contract.
 *
 * `init` constructs all tweens and ScrollTriggers inside a `gsap.context()`
 * scoped to the section element so `ctx.revert()` atomically tears them down.
 * Modules MUST NOT create tweens, ScrollTriggers, or DOM listeners outside
 * the context — leakage breaks breakpoint/reduced-motion swaps.
 */
export interface MotionModule {
  readonly id: string;
  init(el: HTMLElement, mode: Mode): GsapContext;
}
