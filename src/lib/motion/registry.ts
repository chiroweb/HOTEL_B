/**
 * Motion-module registry.
 *
 * Stores a `gsap.Context` per registered section. `destroy(id)` reverts the
 * context — atomically killing every tween, timeline, and ScrollTrigger
 * created inside its callback. `restartAll(mode)` reverts everything and
 * re-inits, used when reduced-motion or breakpoint state flips.
 *
 * Modules register lazily as they enter the viewport (see engine.ts). The
 * registry holds the element + module reference so it can re-init cleanly
 * after a `revert`.
 */

import type { Mode, MotionModule, GsapContext } from './types';

interface RegistryEntry {
  module: MotionModule;
  el: HTMLElement;
  ctx: GsapContext | null;
}

const entries = new Map<string, RegistryEntry>();
let activeMode: Mode = 'desktop';

export function setMode(mode: Mode): void {
  activeMode = mode;
}

export function register(module: MotionModule, el: HTMLElement, mode: Mode): void {
  const existing = entries.get(module.id);
  if (existing) {
    existing.ctx?.revert();
  }
  let ctx: GsapContext | null = null;
  try {
    ctx = module.init(el, mode);
  } catch (err) {
    console.error(`[motion] init failed for "${module.id}":`, err);
  }
  entries.set(module.id, { module, el, ctx });
}

export function destroy(id: string): void {
  const entry = entries.get(id);
  if (!entry) return;
  entry.ctx?.revert();
  entries.delete(id);
}

export function destroyAll(): void {
  for (const entry of entries.values()) {
    entry.ctx?.revert();
  }
  entries.clear();
}

export function restartAll(mode: Mode): void {
  activeMode = mode;
  for (const entry of entries.values()) {
    entry.ctx?.revert();
    try {
      entry.ctx = entry.module.init(entry.el, mode);
    } catch (err) {
      console.error(`[motion] re-init failed for "${entry.module.id}":`, err);
      entry.ctx = null;
    }
  }
}

/** Snapshot for diagnostics. Useful in dev to verify HMR doesn't leak triggers. */
export function size(): number {
  return entries.size;
}

export function getMode(): Mode {
  return activeMode;
}
