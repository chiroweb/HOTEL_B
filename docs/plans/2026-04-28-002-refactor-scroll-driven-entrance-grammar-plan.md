---
title: Refactor All Sections to Scroll-Driven Entrance Grammar
type: refactor
status: superseded
superseded_by: docs/plans/2026-04-28-003-refactor-section-snap-navigation-plan.md
superseded_reason: |
  ScrollTrigger scrub-on-entry was the 5th rejected motion grammar.
  User feedback after implementation made the actual intent clear:
  scroll should be a discrete wheel-tick INPUT (one tick = one section
  advance, fixed-duration auto-played transition), not a 1:1 progress
  driver. Plan 003 replaces this with section-snap (fullPage.js style)
  navigation.
date: 2026-04-28
origin:
  - docs/brainstorms/2026-04-27-songjeong-landmark-brief.md
  - docs/plans/2026-04-27-001-feat-songjeong-landmark-site-plan.md
---

# Refactor All Sections to Scroll-Driven Entrance Grammar

## Problem Frame

The site currently runs three different motion grammars across its five sections:

1. **Lock + autoplay** — DAY (4 sub-frames, each locks scroll for 2s while a timeline auto-plays). Implemented via `src/lib/motion/auto-play.ts`.
2. **Pin + scrub + snap labels** — SPACE (s1 → s2 over 200vh of pin), WINDOW (pin + scrub for image scale + floating frames).
3. **Discrete entrance reveals** — PROLOGUE (entrance timeline on mount), LANDMARK (currently empty awaiting redesign).

The user has now rejected the lock+autoplay grammar after seeing it run:

> *"갑자기 도착하면 툭 하면서 인터렉션 진행되더라, 일단 내가 원하는 것은 이게 아니라, [...] 더 스크롤 하면 오른쪽에서 자연스럽게 넘어오며 도착하는 그런 인터렉션이 보고 싶은거야 [...] 스크롤은 단순히 트리거가 되고, 모든 섹션이 한 화면으로 부드럽게 착착 진행되는 그런 것을 원하는건데"*

Translated: section arrival currently feels abrupt — section snaps into place, *then* its animation begins. The user wants the opposite — **the user's own scroll motion drives the photo's slide-in**, so by the time the section is centered in viewport, the entrance is already complete. Scroll is the conductor, not just a trigger button. All sections should feel like one continuous editorial sequence reading "착착" (smoothly, beat by beat).

This is the **fifth** motion grammar attempted in this redesign cycle. Each prior attempt failed in a specific way:

| # | Grammar | Failure mode |
|---|---------|--------------|
| 1 | Pin + scrub horizontal track (DAY) | Felt "stuck" — too long pinned |
| 2 | Vertical 100svh snap stack | "그냥 나열" — no transition between frames |
| 3 | Pin + scrub + cross-transition + snap labels | "마그네틱이 잡아주는" — too forceful |
| 4 | Lock + autoplay (2s per frame) | "툭" — abrupt start, scroll feels broken |
| **5** | **Scroll-driven entrance (this plan)** | **— target —** |

The unifying insight: a single grammar must apply to every section. Mixing pin/snap/lock/scrub creates visual register breaks — the user reads them as bugs, not design choices.

## Requirements Trace

| ID | Requirement | Source |
|----|-------------|--------|
| R1 | Scroll directly drives entrance progress (no autoplay) | User: *"스크롤이 트리거가 되고"* + *"착착"* |
| R2 | Photo slides from edge into final position as section enters viewport | User: *"오른쪽에서 자연스럽게 넘어오며 도착"* |
| R3 | Arrival = completion (timeline reaches 100% when section is centered) | User: *"도착하는 그런 인터렉션"* |
| R4 | No scroll lock, no forced playback, free scroll throughout | User: *"이건 지금 내가 원하는것이 아니라"* re: lock+autoplay |
| R5 | All sections share the same grammar (visual coherence) | User: *"모든 섹션이 한 화면으로 부드럽게"* |
| R6 | DAY's 4 sub-frames each get the same entrance treatment | Origin plan §DAY + diamond rotation kept |
| R7 | Mobile + reduced-motion: collapse to simple top-75% reveal (no scrub) | Origin plan §State lifecycle, WCAG 2.3.3 |
| R8 | Keep Lenis page-level snap on Coast + Address only (page bookends) | engine.ts existing decision |
| R9 | LANDMARK stays empty (awaiting separate redesign per S188) | User: *"섹션 2 비워둬"* |
| R10 | SPACE keeps its hover-driven sub-category gallery (already approved) | Prior session |

## Scope Boundaries

**In scope:**
- Replace `auto-play.ts` lock helper with a `scrubReveal` helper used by all motion modules.
- Rewrite DAY, WINDOW, SPACE, PROLOGUE motion modules to use the new helper.
- Keep DAY's CSS (4 frames, diamond rotation, 100svh each) — only the JS changes.
- Re-enable Lenis snap targets for `day-morning/surf/walk/light` so each frame still gets a magnetic landing *after* its scrub completes.
- Delete `auto-play.ts`.

**Out of scope:**
- LANDMARK redesign (separate plan, currently empty).
- New visual layouts, copy changes, image swaps.
- COAST → DAY handoff polish (flagged as deferred).
- Color/typography tokens.

## Context & Research

### Local research

**Current architecture (`src/lib/motion/`):**
- `engine.ts` — Lenis × GSAP boot, `SNAP_TARGETS = ['coast', 'address']`, breakpoint + reduced-motion + bfcache lifecycle gates.
- `auto-play.ts` — `lockedAutoPlay()` helper. **TO DELETE.**
- `day.ts` — Iterates 4 `.day-frame` elements, calls `lockedAutoPlay` for each with a from() timeline (photo slide x:±80, float y:24, copy y:18). **TO REWRITE.**
- `window.ts` — Pin + scrub for hero image scale + floating frame entrance. **TO SIMPLIFY.**
- `space.ts` — Pin (200vh) + scrub for s1→s2 crossing, snap labels. **TO SIMPLIFY (drop pin or shorten).**
- `prologue.ts` — Entrance timeline on mount, video mount on intersect. **TO CONVERT to scrub.**
- `snap.ts` — Lenis proximity snap with try/catch addElement guard.
- `breakpoint.ts`, `reduced-motion.ts`, `bfcache.ts`, `registry.ts` — lifecycle infra (no changes).

**Key institutional learnings to honor:**
- *"The snap-toll WebKit bug fires above velocityThreshold:1.5"* — keep current 1.2.
- *"Lazy IntersectionObserver(rootMargin:50%) means ScrollTrigger 'top 70%' once-triggers can miss"* — already mitigated by `ScrollTrigger.refresh(true)` after init in modules; carry forward in new helper.
- *"GSAP pin math + Lenis snap = cumulative drift"* — drop pins where possible; only SPACE retains a short pin (because s1→s2 needs a held identity moment).

### External research

Skipped. The pattern (ScrollTrigger scrub-on-entry where `start: 'top bottom'` and `end: 'top center'` or `'top 25%'`) is a well-established GSAP idiom and the codebase already uses ScrollTrigger extensively. No version-specific risk: GSAP 3.12 supports all required APIs.

### Mental model — the "착착" beat

```
       viewport top  ─────────────────────────────────
                            section above (off-screen)
       viewport bot  ─────  ▼ section's TOP enters here  ─── progress: 0
                            section translating up
                            photo sliding in from right edge
                            copy fading up
       viewport ctr  ─────  ▼ section's TOP at viewport top  ─── progress: 1
                            section now fully in frame, animation done
                            user keeps scrolling, section translates up off-screen
                            no lock, no snap-back, just continues
```

The whole entrance happens during the **inbound travel** between when the section's top crosses the viewport bottom and when it lands at the viewport top. By the time the section is "in place," the photo has already arrived from the right. There is never a still moment followed by a sudden start — the motion *is* the scroll.

## Key Technical Decisions

### D1: ScrollTrigger scrub-on-entry as the universal grammar

For every section's entrance reveal:

```ts
ScrollTrigger.create({
  trigger: el,
  start: 'top bottom',   // section's top crosses viewport bottom
  end: 'top top',        // section's top reaches viewport top
  scrub: 1,              // 1s catch-up; smoothes over micro scroll jitter
  animation: tl,         // the from() timeline (photo slide, copy fade, float drift)
});
```

`scrub: 1` (rather than `true` or `0.5`) gives a slight lag that reads as inertia — the photo "catches up" to the scroll, which is exactly what the user described as 자연스럽게.

### D2: Drop pins on DAY and WINDOW

DAY's 4 sub-frames are already 100svh each, so the natural document height already gives each frame a full viewport of scroll real estate — pinning would only re-introduce the "stuck" feeling.

WINDOW's hero scale + floating frames can complete entirely during entry (`top bottom` → `top top`); the pin was overkill for what is essentially a one-shot reveal.

### D3: SPACE keeps a short pin (120%, down from 200%)

SPACE has a *two-state identity* (sense → structure) that needs a beat where the user can read the structure overlay before scrolling continues. Pure scrub-on-entry would make s2 feel like a flash. Keep the pin but shorten it from `+=200%` to `+=120%` — long enough to register, short enough to not feel stuck.

### D4: PROLOGUE converts to scrub-on-entry too

Currently PROLOGUE plays on mount (because it's the first viewport). Convert it to scrub-on-entry so the very first scroll *immediately* begins driving the photo arrival. This makes the first frame of user interaction match every subsequent frame's grammar — there is no "intro plays itself, then scroll takes over" register break.

For users who land on the page and *don't* scroll, the timeline rests at progress 0 (photo in slid-out position). The first scroll wheel tick reveals it. This is the user's literal request: *"스크롤은 단순히 트리거가 되고."*

### D5: Re-enable Lenis snap on DAY's 4 frames

After scrub completes (section centered), Lenis snap pulls the next frame's top to the viewport top — giving the discrete "frame-by-frame reading" rhythm the diamond rotation is built for. Without snap, fast scroll would skip past frames; with snap, each frame gets its full 100svh reading window.

This is **page-level snap** (Lenis), not ScrollTrigger snap. The two layers do not fight because there are no pins on DAY anymore — Lenis has free reign over the scroll position.

`SNAP_TARGETS` becomes:
```ts
const SNAP_TARGETS = ['coast', 'day-morning', 'day-surf', 'day-walk', 'day-light', 'address'];
```

### D6: Mobile + reduced-motion fallback

`scrubReveal` short-circuits to the existing `top 75%` once-fire entrance timeline. Same as today's `lockedAutoPlay` mobile path. WCAG 2.3.3 compliance preserved.

### D7: Slide direction is corner-aware (DAY only)

Each DAY frame has `data-position` ∈ {tr, tl, br, bl}. The photo slides from its own edge: tr/br slide from +80px right, tl/bl slide from -80px left. This makes the entrance feel like the photo is "coming home" to its corner, not a uniform left→right swipe. Keep the existing `slideOriginX(position)` helper.

For non-DAY sections (PROLOGUE, WINDOW, SPACE), the slide direction is fixed by the layout (right edge for SPACE image; right edge for PROLOGUE; up-from-below for WINDOW floats).

## Open Questions

### Resolved during planning

- **Q: Should we keep the 2-second autoplay duration semantically (i.e., set scrub duration to 2s)?**
  A: No. Scrub doesn't have a "duration" — it's tied to scroll distance. The 2s figure was an artifact of autoplay; replacing it with `top bottom → top top` (one viewport's worth of scroll, ~700px on desktop) gives a similar pacing for an average scroll velocity but adapts naturally to user scroll speed. Fast scrollers see a fast entrance; slow scrollers see a slow one. This *is* the user's *"착착"* feel.

- **Q: Does Lenis snap on 4 DAY frames cause cumulative drift like before?**
  A: No, because there are no pins on DAY anymore. Cumulative drift was caused by GSAP pin math advancing the document height while Lenis was snapping to fixed offsets. Without pins, document height is stable.

- **Q: Should COAST be a snap target?**
  A: Already is (`'coast'`). Keep it — it's the start-of-page anchor.

### Deferred to implementation

- Tuning slide distance (currently ±80px) — visually verify after rewrite, may want ±60 or ±100.
- Tuning scrub coefficient (`1` vs `0.8` vs `1.5`) — verify with browser feel.
- Whether SPACE's pinned 120% feels right or needs to drop to 100% / extend to 150% — adjust after seeing it in motion.
- Whether to use `markers: true` during dev for trigger boundary verification — local-only, not part of plan deliverable.

## High-Level Technical Design

> *This sketch is directional guidance for review, not implementation specification.*

### Universal entry-scrub helper

```ts
// src/lib/motion/scrub-reveal.ts
export interface ScrubRevealConfig {
  trigger: HTMLElement;
  build: () => gsap.core.Timeline;   // paused timeline
  mode: Mode;
  start?: string;   // default 'top bottom'
  end?: string;     // default 'top top'
  scrub?: number;   // default 1
}

export function scrubReveal(cfg: ScrubRevealConfig): void {
  const reduce = shouldReduce();
  const skipScrub = cfg.mode === 'mobile' || reduce;
  const tl = cfg.build();

  if (skipScrub) {
    ScrollTrigger.create({
      trigger: cfg.trigger,
      start: 'top 75%',
      onEnter: () => tl.play(0),
      onEnterBack: () => tl.play(0),
    });
    return;
  }

  ScrollTrigger.create({
    trigger: cfg.trigger,
    start: cfg.start ?? 'top bottom',
    end: cfg.end ?? 'top top',
    scrub: cfg.scrub ?? 1,
    animation: tl,
  });
}
```

### Per-section call sites

```
PROLOGUE  →  scrubReveal({ trigger: el, build: () => entranceTimeline })
DAY       →  for each .day-frame: scrubReveal({ trigger: frame, build: () => frameTimeline(position) })
WINDOW    →  scrubReveal({ trigger: el, build: () => windowEntranceTimeline })
SPACE     →  scrubReveal for entrance copy + retained shorter pin (120%) for s1→s2
ADDRESS   →  scrubReveal({ trigger: el, build: () => addressEntranceTimeline })
LANDMARK  →  empty (out of scope)
```

### Lifecycle interaction map

```
boot()
  ├── Lenis (page scroll)
  ├── ScrollTrigger (drives all scrub timelines via Lenis 'scroll' event)
  ├── Snap (Lenis snap, targets: coast + day×4 + address)
  └── per-module init() (called via lazy IntersectionObserver in motion-bridge)
        └── scrubReveal() per entrance
```

No new lifecycle pieces. The change is grammar-only.

## Implementation Units

### Unit 1: Add `scrubReveal` helper, delete `auto-play.ts`

**Goal:** Introduce the unified scroll-driven entrance helper; remove the rejected lock+autoplay helper.

**Requirements:** R1, R3, R4, R5, R7

**Dependencies:** None (foundational)

**Files:**
- Create: `src/lib/motion/scrub-reveal.ts`
- Delete: `src/lib/motion/auto-play.ts`

**Approach:**
- New helper signature mirrors the old `AutoPlayConfig` so adoption diff is minimal: `{ trigger, build, mode, start?, end?, scrub? }`.
- Mobile + reduced-motion path identical to old `skipLock` branch (`top 75%` once trigger).
- Desktop path: `ScrollTrigger.create({ ..., scrub: 1, animation: tl })` — no `lenis.stop()`, no `html.style.overflow`, no ESC handler (none of those make sense for scrub).
- Document the helper with a top-of-file comment explaining the *"착착"* contract and why scrub-on-entry replaced lock+autoplay.

**Patterns to follow:**
- File-top comment style of `engine.ts` and `auto-play.ts` (the existing soon-to-be-deleted file is a good shape reference).
- Import order convention: gsap → ScrollTrigger → local imports.
- Use `import type { Mode }` (already convention).

**Test scenarios (manual, since no test harness):**
- Helper is exported and importable from `'./scrub-reveal'`.
- Calling with `mode: 'desktop'` creates a ScrollTrigger with `scrub` set.
- Calling with `mode: 'mobile'` creates a ScrollTrigger with `start: 'top 75%'` and no scrub.
- `auto-play.ts` no longer exists; no module imports it.

**Verification:**
- `astro check` reports 0 errors (the rest of the modules will fail import until Units 2-5 complete; either land all in one commit or order them tightly).
- `grep -r 'lockedAutoPlay\|auto-play' src/` returns no hits after Unit 5.

---

### Unit 2: Rewrite `day.ts` to scrub-on-entry per sub-frame

**Goal:** Replace lock+autoplay with scrub-driven photo arrival on each of the 4 DAY frames; preserve corner-aware slide direction.

**Requirements:** R1, R2, R3, R4, R6

**Dependencies:** Unit 1

**Files:**
- Modify: `src/lib/motion/day.ts`
- Touch: `src/styles/day.css` (no semantic change; verify `position` and dimensions still make sense without the lock — should already be correct)

**Approach:**
- Keep the `slideOriginX(position, reduce)` helper (already correct, ±80 based on tr/br vs tl/bl).
- For each `.day-frame`, build a timeline that uses `from()` for photo (x: slideOriginX, opacity: 0), float (y: 24, opacity: 0), copy (y: 18, opacity: 0).
- Replace the `lockedAutoPlay({ trigger: frame, duration: FRAME_DURATION, mode, build })` call with `scrubReveal({ trigger: frame, build, mode })`.
- Remove `FRAME_DURATION` constant — not relevant to scrub.
- Update the file's top doc-comment to reflect the new grammar (drop *"lock + autoplay 2s"* language, add *"scroll-driven entrance"*).
- The diamond rotation positions and frame staggering inside the timeline use `0`, `0.3`, `0.45` offsets — these now read as **fraction-of-scrub-window** rather than seconds, which is the same in scrub semantics. Keep the values; visually verify pacing.

**Patterns to follow:**
- `space.ts`'s `gsap.context(() => { ... }, el)` wrapper for atomic teardown.
- `space.ts`'s `if (reduce || mode === 'mobile')` short-circuit if needed (in this case `scrubReveal` itself short-circuits, so the module doesn't need to branch).

**Test scenarios:**
- Scroll DAY section slowly: photo for each frame slides in proportionally to scroll distance; arrives when frame's top hits viewport top.
- Scroll fast: photos still arrive (catch-up due to `scrub: 1`).
- Scroll back up: photos slide back out (scrub is bidirectional). User has not objected to this — verify the feel; if it reads as too "rewindy," consider `once: true` later.
- Mobile (resize to ≤768px): photos appear via `top 75%` fade-in, no scrub.
- Reduced-motion: same as mobile path.
- All 4 frames behave identically in shape, only differ in slide direction per `data-position`.

**Verification:**
- Browser at desktop width: scrolling from PROLOGUE into DAY shows the 1st frame's photo arriving smoothly from its corner; landing at frame center = photo in place.
- Lenis snap pulls next frame's top to viewport top after entrance completes (Unit 6 enables this).
- No console errors, no layout shift.

---

### Unit 3: Simplify `window.ts` to scrub-on-entry (drop pin)

**Goal:** Remove WINDOW's pin; convert hero image scale + floating frame entrance to scrub-on-entry.

**Requirements:** R1, R2, R3, R4, R5

**Dependencies:** Unit 1

**Files:**
- Modify: `src/lib/motion/window.ts`

**Approach:**
- Remove the `scrollTrigger: { pin: true, scrub, start, end, anticipatePin }` from the main timeline.
- Build a timeline that runs hero image entrance (scale 1.04 → 1, opacity 0 → 1) + floating frame staggered entry (y: 40 → 0, opacity: 0 → 1) all within scrub window.
- Pass to `scrubReveal({ trigger: el, build, mode })`.
- Update the file's top doc-comment.

**Patterns to follow:**
- Stagger floating frames using `tl.from(floats, { y: 40, opacity: 0, duration: 0.7, stagger: 0.12 }, 0.2)`.
- `gsap.context()` wrapper.

**Test scenarios:**
- WINDOW section enters viewport: hero image scales down from 1.04 to 1 as user scrolls; floats fade up sequentially.
- By the time WINDOW is centered, all entrance motion is complete.
- No pin = no `pinSpacer` injected = no document height change between mounts.

**Verification:**
- `getBoundingClientRect()` of `#window` is stable (no pin spacer changing height).
- Visually: smooth read from DAY's last frame into WINDOW with no "stop and pin" beat.

---

### Unit 4: Shorten SPACE pin (200% → 120%); keep s1→s2 scrub

**Goal:** Keep SPACE's two-state identity but shorten the pin so it doesn't read as "stuck."

**Requirements:** R1, R5; preserves SPACE's hover-driven gallery (R10)

**Dependencies:** Unit 1 (helper used for entrance copy reveal only)

**Files:**
- Modify: `src/lib/motion/space.ts`

**Approach:**
- Entrance copy timeline (mono / display / ko reveal) — convert from on-mount to `scrubReveal` so the first paint is the slid-out state and the user's scroll into SPACE drives the copy in.
- Main pin timeline: change `end: '+=200%'` → `end: '+=120%'`.
- Keep snap labels `s1` / `s2` — they're still useful within the shorter pin window.
- Keep `activate` / `deactivate` `will-change` toggling.
- Update file top doc-comment to reflect the change ("pin shortened to 120% so identity beat doesn't outstay welcome").

**Patterns to follow:**
- Existing SPACE structure is already close — minimal diff.

**Test scenarios:**
- Scroll into SPACE: copy slides in via scrub (not on-mount).
- Pin engages, image translates left while cats fade in over 120% of viewport.
- Snap labels still pull s1 / s2 — magnetic landing reads as a discrete settle.
- Hover sub-categories still cross-fade gallery images (existing behavior preserved).

**Verification:**
- Pin spacer = `1.2 * 100svh = ~960px` instead of `~1600px` — faster transit.
- Snap to s2 still feels like a "click" landing, not a yank.

---

### Unit 5: Convert `prologue.ts` to scrub-on-entry

**Goal:** Replace on-mount entrance timeline with scroll-driven entrance, so the very first user scroll matches the rest of the page's grammar.

**Requirements:** R1, R3, R4, R5

**Dependencies:** Unit 1

**Files:**
- Modify: `src/lib/motion/prologue.ts`

**Approach:**
- Keep video mount logic (intersect-once → load video).
- Replace `enter.from(...).from(...)` direct play with `scrubReveal({ trigger: el, build: () => entranceTimeline, mode, start: 'top bottom', end: 'top center' })` — `top center` (vs `top top`) because PROLOGUE is the first section and starts already partly in view; `top center` lets the entrance complete by the time the user has scrolled the masthead into the upper half of the viewport.
- Set initial state: text and overlay positioned in their slid-out / faded states (so the very first paint is the *pre-entrance* state, and the entrance plays as the user scrolls).
- Update file top doc-comment.

**Patterns to follow:**
- Video mount remains decoupled from the entrance timeline (lazy-loaded via IntersectionObserver, unaffected by scrub).

**Test scenarios:**
- Page load: PROLOGUE shows initial state (text in slid-out position, hairlines faded).
- First scroll wheel tick: entrance animates proportionally.
- By the time the user has scrolled ~50svh, PROLOGUE entrance is complete and the user is heading into DAY.
- No "intro plays then snaps to user-driven" register break.

**Verification:**
- Page load with no scroll: text not yet in final position.
- One scroll tick: text begins arriving.
- Continued scroll: text in place by the time COAST's bottom edge approaches viewport top.

---

### Unit 6: Re-enable Lenis snap on DAY's 4 frames

**Goal:** Restore frame-by-frame magnetic landing for DAY now that pin-induced drift is gone.

**Requirements:** R6, R8

**Dependencies:** Unit 2 (DAY rewrite must be in place — adding snap before that re-introduces the pin-vs-snap fight)

**Files:**
- Modify: `src/lib/motion/engine.ts`

**Approach:**
- `SNAP_TARGETS` becomes `['coast', 'day-morning', 'day-surf', 'day-walk', 'day-light', 'address']`.
- Update the comment block above `SNAP_TARGETS` to reflect the new architecture: *"Day's 4 sub-frames are now scroll-driven entrance (no pin), so they can be Lenis snap targets again — magnetic landing gives each frame its full reading window."*
- Keep `velocityThreshold: 1.2` and `duration: 1.6` — these were already tuned and the previous "scroll lock not working" bug was a different root cause (resolved in S187).

**Patterns to follow:**
- Existing `createSnap()` config — no shape change, only target list.

**Test scenarios:**
- Scrolling slowly through DAY: each frame settles to its top at viewport top.
- Scrolling fast: snap doesn't trigger (velocityThreshold gate).
- Reduced-motion: native CSS scroll-snap fallback already covers this case.

**Verification:**
- `console.log` from snap.ts shows `[snap] addElement` succeeding for all 6 IDs.
- No `addElement failed` warnings.
- DAY frames feel like discrete reading windows, not one continuous scroll.

---

### Unit 7: Sweep doc comments + verify no orphan references

**Goal:** Final pass to ensure no comment, type, or code path still references the old lock+autoplay grammar.

**Requirements:** All — quality gate

**Dependencies:** Units 1-6

**Files:**
- Touch: any file with stale references to `lockedAutoPlay`, `auto-play`, `lock + autoplay`, `FRAME_DURATION`, *"locks scroll for 2s"*, etc.
- Likely: `src/styles/day.css` top comment, `src/components/sections/Day.astro` if it has any comment about lock behavior.

**Approach:**
- `grep -r -i 'lockedAutoPlay\|auto-play\|FRAME_DURATION\|locks scroll' src/`
- Update or delete each remaining mention.
- Verify file-top doc comments accurately describe new grammar in: `day.ts`, `window.ts`, `space.ts`, `prologue.ts`, `scrub-reveal.ts`, `engine.ts` (SNAP_TARGETS comment).

**Test scenarios:**
- `grep` returns no results.
- `astro check` 0 errors / 0 warnings.

**Verification:**
- Read each motion module's top doc-comment — first paragraph clearly states "scroll-driven entrance" grammar.
- No file describes a behavior the code no longer implements.

## System-Wide Impact

**Files modified:** 6 (engine.ts, day.ts, window.ts, space.ts, prologue.ts, day.css doc-comment)
**Files created:** 1 (scrub-reveal.ts)
**Files deleted:** 1 (auto-play.ts)

**Affected systems:**
- **Scroll behavior** — every section's entrance feel changes.
- **Document height** — WINDOW loses its pin spacer; SPACE's pin spacer shrinks ~480px. Net document height decreases by ~1100-1500px.
- **Snap behavior** — gains 4 new targets (DAY frames).
- **Motion module count** — unchanged (5 modules, same registry IDs).

**Affected stakeholders:**
- **End user** — sees the corrected grammar match the brief.
- **Future implementer** (LANDMARK redesign, Address polish) — `scrubReveal` becomes the canonical entrance helper to call.

**Affected docs:**
- `docs/plans/2026-04-27-001-feat-songjeong-landmark-site-plan.md` — describes lock+autoplay as the original spec; this plan supersedes that section. No edit required (historical record).
- `docs/brainstorms/2026-04-27-songjeong-landmark-brief.md` — original brief, scroll grammar described in abstract terms; still valid.

## Risks & Dependencies

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Scrub-back (scroll-up rewinds entrance) reads as "rewindy" | Medium | Low | Verify in browser; if rejected, swap to `once: true` + `onEnter` play (no scrub-back) — small one-line change per module |
| Lenis snap on 4 DAY frames conflicts with ScrollTrigger scrub on those same frames | Low | Medium | They operate at different layers (Lenis = page scroll, ScrollTrigger = animation progress); no shared state. Verified architecturally in D2 + D5. If issues arise, snap can be deferred to Unit 7 fallback (drop the 4 day-* targets, keep only coast + address) |
| `top bottom → top top` window is too short on tall sections (DAY frames are 100svh, so the trigger window is exactly 100svh — entrance has 1 viewport of scroll to complete) | Low | Low | Tune via `start`/`end` per section (e.g., `top 90%` → `top 10%` for tighter window) |
| PROLOGUE initial state visible on page load (pre-entrance state shows text in slid-out position) might look "broken" for 1 frame before scroll | Low | Low | Acceptable trade-off — first scroll is immediate; alternative is back to on-mount which loses grammar coherence (R5) |
| `auto-play.ts` deletion breaks any module not yet updated | Medium | High | Order Units 1-5 tightly; verify `grep` clean before commit |

**External dependencies:** None new. Existing GSAP 3.12, Lenis 1.x, Astro 5.2 unchanged.

## Sources

- User feedback (this session, 2026-04-28): rejection of lock+autoplay grammar with screenshot evidence
- `docs/brainstorms/2026-04-27-songjeong-landmark-brief.md` — original motion grammar brief
- `docs/plans/2026-04-27-001-feat-songjeong-landmark-site-plan.md` — original site plan (origin doc)
- `docs/solutions/` — institutional learnings on Lenis × GSAP × pin × snap interactions (S187, S188 specifically)
- GSAP ScrollTrigger docs — `scrub`, `start`, `end` semantics (well-known idiom; no version-specific concerns)
- Existing motion module file headers — referenced for doc-comment style and `gsap.context` patterns
