/**
 * Hijack registry — section controllers expose their advance API here so
 * scroll-hijack.ts can drive section-internal stages from wheel/touch/key
 * input.
 *
 * A SectionController has:
 *   - totalStages: how many internal stages this section has (>= 1)
 *   - advance(toIndex): tween to that internal stage. Index is 0-based.
 *   - reveal(): kick the section's entrance reveals if any (called when the
 *     section first becomes the active one).
 */

export interface SectionController {
  readonly totalStages: number;
  readonly advance: (toIndex: number) => void;
  readonly reveal?: () => void;
}

const controllers = new Map<string, SectionController>();

export function register(sectionId: string, controller: SectionController): void {
  controllers.set(sectionId, controller);
}

export function getController(sectionId: string): SectionController | undefined {
  return controllers.get(sectionId);
}

export function clear(): void {
  controllers.clear();
}
