/**
 * Hijack mode flag.
 *
 * Set to true at engine boot when scroll-hijack is going to take over input
 * (desktop + non-reduced-motion). Per-section motion modules read this at
 * setup() time and skip building scroll-driven ScrollTriggers; instead they
 * register themselves with the hijack registry and expose advance APIs that
 * scroll-hijack drives in response to wheel/touch/key inputs.
 */

let active = false;

export function setHijackActive(v: boolean): void {
  active = v;
}

export function isHijackActive(): boolean {
  return active;
}
