/**
 * Shared motion-system types.
 *
 * Per-section "module" shape moved from a single init() callback to a
 * `provideChain(el, mode): ChainEntry[]` factory in section-chain.ts.
 * See plan 2026-04-28-003 for the architecture.
 */

import { gsap } from 'gsap';

export type GsapContext = ReturnType<typeof gsap.context>;

export type Mode = 'desktop' | 'mobile';
