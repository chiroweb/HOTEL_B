/**
 * Reduced-motion gate.
 *
 * Returns true if EITHER:
 *   • `(prefers-reduced-motion: reduce)` matches, OR
 *   • the user's connection signals Save-Data mode, OR
 *   • the connection's effectiveType is slow-2g or 2g.
 *
 * Phase 1 takes the same path for all three signals so the editorial site
 * does not impose buttery scroll choreography on bandwidth/accessibility-
 * sensitive sessions (R9, plan §Performance Budget).
 */

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g' | string;
  addEventListener?: (type: 'change', listener: () => void) => void;
  removeEventListener?: (type: 'change', listener: () => void) => void;
};

const SLOW_TYPES = new Set(['slow-2g', '2g']);

function getConnection(): NetworkInformation | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as unknown as { connection?: NetworkInformation }).connection;
}

export function shouldReduce(): boolean {
  if (typeof window === 'undefined') return true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;

  const conn = getConnection();
  if (conn?.saveData === true) return true;
  if (conn?.effectiveType && SLOW_TYPES.has(conn.effectiveType)) return true;

  return false;
}

/**
 * Subscribe to reduced-motion changes (matchMedia + Save-Data toggle).
 * Returns an unsubscribe function.
 */
export function onReducedMotionChange(listener: (reduce: boolean) => void): () => void {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const conn = getConnection();
  let last = shouldReduce();

  const handler = () => {
    const next = shouldReduce();
    if (next !== last) {
      last = next;
      listener(next);
    }
  };

  mq.addEventListener('change', handler);
  conn?.addEventListener?.('change', handler);

  return () => {
    mq.removeEventListener('change', handler);
    conn?.removeEventListener?.('change', handler);
  };
}
