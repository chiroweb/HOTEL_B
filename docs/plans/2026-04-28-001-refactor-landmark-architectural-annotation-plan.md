---
title: LANDMARK Section as Architectural Annotation Spread
type: refactor
status: active
date: 2026-04-28
origin: docs/plans/2026-04-27-001-feat-songjeong-landmark-site-plan.md
---

# LANDMARK Section as Architectural Annotation Spread

## Overview

LANDMARK currently uses a CG twin-tower render (LANDMARK-01) with a 50/50 horizontal decomposition motion that reads as a slideshow and brings advertorial color (the lit WYNDHAM media-facade panel) into an otherwise warm-desaturated palette. This refactor replaces the section with a **single full-bleed facade close-up (LANDMARK-02) annotated by mono labels and 1px brass hairlines**, sequentially revealed during the existing 200svh pin. The result is the site's only "magazine spread" moment — typography speaks the language of architecture for the first time, the brass hairline does real informational work (the most R4-aligned use case in the site), and all five structural mismatches diagnosed in Section 2 are resolved.

## Problem Frame

LANDMARK is the only section currently mismatched against the editorial register. Five overlapping issues:

1. **CG advertorial register.** LANDMARK-01 is a CG render whose lit blue WYNDHAM media-facade panel reads as advertising. Even at −28% saturation, the panel attracts the eye first; cyan/blue is alien to the 5-color palette (ivory/bone/ink/hair/brass).
2. **Slideshow-style stage transition.** Stage 1 (object-position vertical scrub, progress 0→0.6) and Stage 2 (xPercent −15 + facade entry, 0.6→1.0) are two discrete events stitched at progress 0.6 — exactly the slideshow form R2 explicitly rejects.
3. **Symmetric 50/50 grid.** Every other section honors R6 "asymmetric grids" (Coast bottom-left, FLOW left-anchored time, WINDOW asymmetric floats, SPACE 60vw image then text). LANDMARK alone uses a balanced two-column split — structurally ill-fitting.
4. **Palette intrusion.** R4's spirit is "no color outside the 5-color palette". The CG's blue media-facade glow violates it. Other sections all carry warm-desaturated grades exclusively.
5. **Unmotivated motion.** Editorial choreography reveals content the user is reading. LANDMARK's current motion performs a "show two images" trick — the user is not actively scanning; the page is sliding things around.

## Requirements Trace

Carried from origin (`docs/plans/2026-04-27-001-feat-songjeong-landmark-site-plan.md`):

- **R2** — Each section has a distinct scroll behavior, *not slideshow-y*. Sequential annotation reveal is unique to this section.
- **R4** — Brass strict-scope (hairlines, mono labels, numerals, active states only). The 1px pointer hairlines exemplify the information-bearing role brass was reserved for; this becomes the most R4-aligned section in the site.
- **R5** — Typography carries the design. Mono labels at architectural points = typography doing semantic work, not decoration.
- **R6** — Asymmetric grids, large negative space, hairline rules, sharp edges. Single-image frame + right-anchored annotation column gives the asymmetric grid; 1px hairlines become the primary informational affordance.
- **R7** — Per-section motion grammar. LANDMARK's grammar becomes "annotated reveal" instead of "horizontal decomposition".
- **R8** — Reveal motion 720–1100ms, ease editorial. Each annotation reveal lands in this window.
- **R9** — `prefers-reduced-motion` fully respected. Reduced path: all annotations rendered visible at once, no transforms.
- **R12** — Photography assumes refined warm-desaturated cinematic grading. Removing the CG aligns LANDMARK with the photography standard the rest of the site holds.

## Scope Boundaries

**In scope**
- Refactor `src/components/sections/Landmark.astro` to single-image annotation layout.
- Replace `src/lib/motion/landmark.ts` choreography (entrance + sequential annotation reveal).
- Rewrite `src/styles/landmark.css` for new layout + annotation overlay system.
- Create `src/components/Annotation.astro` reusable primitive.
- Update `src/data/asset-manifest.ts` to remove `LANDMARK-01` from active union (file stays on disk for archival).
- Update `docs/assets-needed.md` row status.

**Out of scope (explicit non-goals)**
- Re-shooting LANDMARK-01. The CG is removed entirely from the active site; if a real building photograph arrives later, that is a separate Phase 3 swap.
- Adding annotation primitives to other sections.
- Changing the `--pin-landmark` token (stays 200svh).
- Mobile-specific annotation rendering. Mobile collapses to simple image + heading; annotations are desktop-only.
- Adding snap to LANDMARK (it already opts out; would conflict with pin).

## Context & Research

### Relevant Code and Patterns

- `src/components/sections/Landmark.astro` — current 2-image stage layout to be replaced.
- `src/lib/motion/landmark.ts` — current pin + 2-stage scrub timeline (entrance reveal + Stage 1 object-position + Stage 2 xPercent/scale).
- `src/styles/landmark.css` — current 2-column grid + reduced-motion stack rules.
- `src/components/SectionWrapper.astro` — semantic wrapper. New layout uses default body slot for image + annotation overlay.
- `src/styles/sections.css` — base section styling. `[data-section='landmark']` already positions `.section__index` top-right.
- `src/lib/motion/types.ts` + `registry.ts` — `MotionModule` contract; `init()` returns `gsap.Context` for atomic teardown.
- `src/lib/motion/breakpoint.ts` — `currentMode()` returns `'desktop' | 'mobile'` for branching.
- `src/lib/motion/reduced-motion.ts` — `shouldReduce()` gate.
- Pattern parallel — labeled-timeline scrub reveals: `src/lib/motion/space.ts` (3-state crossing). LANDMARK adopts the same shape *without snap*.
- Pattern parallel — `onUpdate(progress)` → discrete element state transitions: `src/lib/motion/day.ts` (4 time-label active toggles). LANDMARK reuses the threshold-driven attribute mutation pattern.
- Pattern parallel — single-image frame layout: `src/components/sections/Coast.astro` post-2026-04-28 refactor (centered editorial frame, copy below). LANDMARK frame mirrors this structure.

### Institutional Learnings

- `gsap.context()` teardown handles every motion module's cleanup atomically. Annotations created inside the context get cleaned up at restart.
- HMR cleanup pattern (`if (import.meta.hot) import.meta.hot.dispose(...)`) is non-optional for motion modules; without it, edits leak ScrollTriggers across reloads.

### External References

Skipped — local patterns (Space, Day, Coast) cover all the choreography and layout needs.

## Key Technical Decisions

- **Drop LANDMARK-01 from the active manifest.** Remove its entry from `IMAGES`, remove `'LANDMARK-01'` from the `ImageSlotId` union, remove the import. The JPG file stays at `src/assets/placeholders/LANDMARK-01.jpg` for archival but no component imports it. Restoration = re-add the import + union entry. *Rationale:* clean code over preserved option; the option is preserved on the filesystem, not in stale source.

- **Annotation overlay = HTML labels + CSS-positioned brass spans, not SVG.** Each annotation is a `<div data-annotation>` with absolute positioning relative to the image frame, containing a 1px brass `<span data-hairline>` of fixed visual length and a `<span class="label-mono">` label. Hairline visibility animates via `transform: scaleX(0 → 1)` with `transform-origin: right`. *Rationale:* HTML labels respect the project's typography ramp (`label-mono` class), avoid SVG `<text>` font matching issues, and keep brass restricted to the hairline span (R4 scope clean and audit-friendly).

- **Three annotations: FACADE / RHYTHM / LIGHT.** Pointing respectively to the glass curtain wall (upper third of LANDMARK-02), the vertical fin pattern (middle), and the sunset reflection (lower third). *Rationale:* three is the minimum that reads as an architectural spec, the maximum that fits one side without crowding.

- **All annotations on the right side, stacked vertically.** Left-right alternation creates a busy Z-shape across the image; right-side stacking reads as a controlled list of architectural notes, closer to a magazine archive page. *Rationale:* one-side stacking reinforces the "vertical mark" theme — the labels themselves stack vertically.

- **Pin retained at 200svh.** Sequential reveals need viewport time. Without pin, three reveals + display + KR copy compress into a few hundred px = unreadable. With 200svh: each annotation gets ≈50svh (display+KR ≈50svh first, then 3 × ≈50svh per annotation).

- **Choreography: pure scrub, no snap.** GSAP timeline with progress thresholds 0.20 / 0.45 / 0.70 / 1.0. `snapTo: 'labels'` would create the same "툭" feel the site's main snap was already retuned to remove. Sequential annotation reveal must feel *like a film*, not like discrete states.

- **Hairline draws first (~50ms before label fade-in).** Architectural-drafting feel — line lands at the feature, then the name appears. Reverse order (label first, then line) reads as decoration; line first reads as information.

- **Mobile (≤768px): annotations hidden via `display: none`.** Section collapses to simple image + heading. *Rationale:* legibility of three labels + hairlines + image at ≤768px is poor; the architectural spread is genuinely a desktop reading experience. Section still has identity (the facade close-up + bilingual heading).

- **Reduced-motion: all annotations rendered visible from entry, no transforms.** Information parity preserved.

## Open Questions

### Resolved During Planning

- **Annotation count and content?** 3 labels: FACADE, RHYTHM, LIGHT.
- **Rendering technology?** HTML + CSS, not SVG.
- **Pin length?** Retain 200svh.
- **Snap on annotation states?** No. Pure scrub.
- **Keep LANDMARK-01 on disk?** Yes (archival), but remove from manifest union.
- **All annotations same side or alternating?** Same side (right).
- **Hairline draw direction?** Right edge into image (transform-origin: right; scaleX 0→1).

### Deferred to Implementation

- **Exact annotation Y% positions on the image.** Decide visually during Unit 2 against LANDMARK-02's actual feature regions (where glass starts, where fins are most visible, where sunset reflection lands). May need slight tweaks per breakpoint width.
- **Pointer hairline length.** Default ≈8vw. Adjust visually if too short/long for legibility.
- **Per-element timing within each annotation slot.** E.g., does hairline draw fully before label starts fading, or do they overlap? Decide during Unit 3 visual review.
- **Whether to extend to 4 annotations or contract to 2.** Plan default is 3; can extend (add SCALE) or contract (drop LIGHT) without restructuring code if visual review wants more/less weight.

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

### Layout (desktop)

```
+-------------------------------------------------------+
|                                ( 02 / VERTICAL )      |  ← top-right (sections.css)
|                                                       |
|  ┌─────────────────────────────────────────┐          |
|  │                                         │          |
|  │                              ─────  FACADE         |  ← annotation 1 @ y≈22%
|  │           [LANDMARK-02 image]           │          |
|  │                              ─────  RHYTHM         |  ← annotation 2 @ y≈55%
|  │                                         │          |
|  │                              ─────  LIGHT          |  ← annotation 3 @ y≈82%
|  │                                         │          |
|  └─────────────────────────────────────────┘          |
|                                                       |
|  A VERTICAL MARK ON THE SHORE                         |
|  송정의 수평선 위에 세워지는 수직의 기준.             |
|                                                       |
+-------------------------------------------------------+
```

Image: ≈70vw centered (matches Coast frame width budget). Annotations anchored just outside the right edge of the frame; their hairline extends LEFT into the image, terminating at the feature region. Copy below image, left-aligned to image edge.

### Choreography (200svh pin scrub)

```
progress  0 ──── 0.20 ──── 0.45 ──── 0.70 ──── 1.0
            │       │         │         │
   reveal:  │   FACADE     RHYTHM     LIGHT
   display+KR fades in
   image is static throughout (no scale, no parallax)
```

Each annotation reveal: hairline `transform: scaleX(0 → 1)` over `--duration-state-cross` (480ms) with editorial ease; label `opacity 0 → 1` + tiny y drift. Hairline begins ≈50ms before label fade-in starts.

### Cleanup contract

`gsap.context()` scoped to `#landmark`. `revert()` kills:

- 1× display reveal timeline (entrance, once: true)
- 1× pin scrub timeline (carries the `onUpdate` mutating annotation `[data-state]`)
- All annotation `[data-state]` mutations stop on revert

Mobile branch (`mode === 'mobile'`) returns immediately after copy reveal — pin not constructed. Annotations hidden via CSS `@media (max-width: 768px) { [data-annotation] { display: none; } }`. Reduced-motion gate also returns early; CSS sets `[data-annotation] { ... }` with the visible state by default under `@media (prefers-reduced-motion: reduce)`.

## Implementation Units

- [ ] **Unit 1: Section restructure — single-image layout + manifest cleanup**

**Goal:** LANDMARK section renders LANDMARK-02 as a centered/full-bleed image with copy below; the CG twin-tower image is no longer referenced anywhere in the codebase. Layout is ready to receive annotation overlays in Unit 2.

**Requirements:** R2, R4, R6, R12.

**Dependencies:** None — refactor of existing files.

**Files:**
- Modify: `src/components/sections/Landmark.astro` — drop LANDMARK-01 import, remove `.landmark__stage` two-column structure, add single `.landmark__frame` containing Picture for LANDMARK-02 + empty `.landmark__overlay` annotation container.
- Modify: `src/styles/landmark.css` — rewrite layout. Section grid: image on top (≈70vw centered, aspect-preserved), copy below, no two-column. Drop `.landmark__tower`, `.landmark__detail`, `.landmark__caption`.
- Modify: `src/data/asset-manifest.ts` — remove `'LANDMARK-01'` from `ImageSlotId` union, remove its `IMAGES` entry, remove the `import landmark01` line. Keep `LANDMARK-02`.
- Modify: `docs/assets-needed.md` — LANDMARK-01 row status updated to `(deferred — CG removed from active site; archival JPG retained at src/assets/placeholders/LANDMARK-01.jpg)`.

**Approach:**
- Copy retained: display ("A VERTICAL MARK / ON THE SHORE"), Korean ("송정의 수평선 위에 세워지는 수직의 기준."), index label ("02 / VERTICAL").
- Image full-bleed within frame, 1px hair border (matches Coast frame pattern).
- Copy positioned below frame, left-aligned to frame edge — same column as Coast.
- Section index label position unchanged (top-right per `sections.css`).
- `--pin-landmark` retained at 200svh. Pin construction itself deferred to Unit 3.

**Patterns to follow:** `src/components/sections/Coast.astro` post-refactor (frame + copy below). Same grid-area layout pattern: `frame / copy` rows.

**Test scenarios:**
- Build succeeds with LANDMARK-01 removed from manifest (TypeScript catches stale references).
- Section renders LANDMARK-02 centered, with copy below.
- axe DevTools scan: 0 critical issues (heading still h2-tagged, lang attrs preserved).
- Reduced-motion: section is just image + copy, no broken layout.

**Verification:** Visiting `/` shows LANDMARK with single facade image + copy. No CG render visible anywhere on the site. typecheck/build clean.

---

- [ ] **Unit 2: Annotation primitive + overlay system**

**Goal:** Reusable `<Annotation>` component renders a mono label with a 1px brass hairline pointer, parametrized by Y position and label text. Three instances placed over the LANDMARK-02 image.

**Requirements:** R4 (brass scope = hairline + label only), R5 (typography as content), R6 (1px hairlines).

**Dependencies:** Unit 1.

**Files:**
- Create: `src/components/Annotation.astro` — primitive.
- Modify: `src/components/sections/Landmark.astro` — add 3 `<Annotation>` instances inside the frame's overlay container.
- Modify: `src/styles/landmark.css` — annotation positioning rules + hairline initial state (`transform: scaleX(0); transform-origin: right;`) + visible state.

**Approach:**
- `Annotation.astro` props: `label: string`, `y: number` (% from top of image), `pointerLength?: string` (default `'8vw'`).
- Renders absolute-positioned `<div data-annotation data-state="hidden">` with right-anchored layout. Inner: 1px brass `<span data-hairline>` followed by mono `<span class="label-mono">`. Flex display, hairline first then label.
- CSS: hairline default state `transform: scaleX(0); transform-origin: right;`. `[data-state='visible']` → `scaleX(1)` transition over `--duration-state-cross` with editorial ease. Label `opacity: 0 + translateY(8px)` default; visible → `opacity: 1 + translateY(0)`.
- Three annotations placed in `Landmark.astro` at y=22%, y=55%, y=82% (defaults; tunable).
- Mobile (`@media (max-width: 768px)`): `[data-annotation] { display: none; }`.
- Reduced-motion (`@media (prefers-reduced-motion: reduce)`): default state shows visible; transitions disabled.

**Patterns to follow:**
- `src/components/PauseControl.astro` for the small primitive component shape with scoped CSS.
- `src/styles/space.css` `.space__cats` for hairline-divided list rendering.

**Test scenarios:**
- Annotations render at correct Y positions over LANDMARK-02.
- `data-state='hidden'` → hairline scaleX 0 (invisible); label opacity 0 + Y drift.
- `data-state='visible'` → hairline scaleX 1; label opacity 1 + Y 0.
- Mobile width: annotations hidden, image+copy still readable, no broken overflow.
- Reduced-motion: annotations all visible from entry, no animation.
- Each annotation's hairline + label fits inside the section's right-side gutter without overflowing the section.

**Verification:** Manually toggling `data-state` via DevTools shows each annotation appearing/disappearing with correct hairline scale and label fade.

---

- [ ] **Unit 3: Motion choreography — sequential reveal + cleanup**

**Goal:** Rewrite `landmark.ts`. Pin section 200svh; scrub a timeline that reveals display+KR copy first, then sequentially toggles `[data-state='visible']` on each annotation at progress thresholds 0.20 / 0.45 / 0.70. Mobile and reduced-motion paths return early.

**Requirements:** R2 (distinct scroll grammar), R7, R8 (motion timing 720–1100ms), R9 (reduced-motion).

**Dependencies:** Unit 1, Unit 2.

**Files:**
- Modify: `src/lib/motion/landmark.ts` — rewrite `init()` body.
- Modify: `src/styles/landmark.css` — finalize pin layout + annotation transition timings.

**Approach:**
- Initial entrance reveal (outside pin context): display + KR fade in via `gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 70%', once: true } })`.
- Pin timeline: `pin: true, scrub: 1, start: 'top top', end: '+=200%', anticipatePin: 1, invalidateOnRefresh: true, pinSpacing: true`.
- `onEnter` / `onEnterBack` → activate (will-change on hairlines, drop contain).
- `onLeave` / `onLeaveBack` → deactivate (`contain: layout paint`, clear will-change).
- `onUpdate({ progress })` → compute active index from thresholds `[0.20, 0.45, 0.70]`. For each annotation, set `[data-state]` to `'visible'` if its threshold has been crossed, else `'hidden'`.
- Mobile branch: return after entrance reveal; pin not constructed.
- Reduced-motion branch: return after entrance reveal; CSS sets all annotations visible by default in this media query.
- `import.meta.hot.dispose` retained.

**Execution note:** Land Unit 3 with a single annotation first, verify scroll feel, then add the remaining two. Avoids debugging three-at-once if threshold tuning is off.

**Patterns to follow:**
- `src/lib/motion/space.ts` labeled-timeline structure (s1/s2/s3) — same idea, no snap.
- `src/lib/motion/day.ts` `onUpdate` progress → label state pattern.

**Test scenarios:**
- Slow scroll: display reveal completes before user enters pin; pin scrub progresses through 0→1.0; annotations appear at 20% / 45% / 70%.
- Fast scroll: no overshoot, scrub eases out cleanly.
- Reverse scroll: annotations disappear in reverse order; `data-state` flips back to 'hidden'.
- Mobile (≤768px): no pin, just entrance reveal. Annotations hidden via CSS.
- Reduced-motion: no pin, all annotations visible on entry.
- Resize across 768/769 boundary mid-section: `registry.restartAll(newMode)` cleans pin and re-inits.
- HMR: edit `landmark.ts`; `ScrollTrigger.getAll().length` stays bounded across edits.

**Verification:** Reviewer scrolling through `#landmark` feels three discrete architectural readings — FACADE, then RHYTHM, then LIGHT — each with its own beat. Image stays still. Mobile shows simple image + copy. Reduced-motion shows the full annotated state at once.

## System-Wide Impact

- **Snap targets:** Already excluded from `SNAP_TARGETS` in `engine.ts`. No change.
- **Active-nav state:** `nav-progress.ts` computes active section via Lenis scroll position against pre-declared `[start, end]` ranges. With pin retained at 200svh, the range remains accurate. No change.
- **Layer / paint discipline:** During pin, `will-change: transform` on the 3 hairline elements only. `contain: layout paint` on section while inactive. ≤3 composited layers at LANDMARK/DAY boundary.
- **Bundle size:** `Annotation.astro` adds <1KB gz. `landmark.ts` becomes simpler (no scale/xPercent tweens; just attribute mutations) — likely net smaller. No measurable impact on the 90KB JS budget.
- **Asset manifest type-safety:** `ImageSlotId` union shrinks by 1 entry. Any orphan reference to `'LANDMARK-01'` would fail at compile time.
- **Reduced-motion / Save-Data path:** No new failure modes. Section degrades to image + copy + all-visible annotations.
- **bfcache:** No change — pin `pageshow` rebind already covered by `engine.ts`.

## Risks & Dependencies

- **Annotation positions are coupled to LANDMARK-02 image content.** If the image is later replaced with a different facade shot, the y% and pointer length may need adjustment. *Mitigation:* define them as data in `Landmark.astro` (not buried in CSS) with a comment noting the dependency.
- **Mobile feels empty.** Mobile shows only image + heading; the entire annotation moment is desktop-only. *Mitigation:* the bilingual heading carries enough weight on its own; the annotation spread is genuinely a desktop reading experience. Document this trade-off in manifest tone notes.
- **3 annotations may feel sparse OR may feel crowded.** *Mitigation:* deferred decision allows extending to 4 (add SCALE) or contracting to 2 (drop LIGHT) without restructuring code.
- **200svh pin may feel overlong if content reveals fast.** *Mitigation:* drop to 150svh in `--pin-landmark` token (one-line change) if visual review during Unit 3 says so.
- **HMR with new component:** `Annotation.astro` is new in the codebase. Re-test HMR after Unit 2 to confirm no leaking.
- **Brass-scope audit risk:** This refactor introduces brass into a *new structural location* (the annotation hairline). Confirm during Unit 2 review that no other CSS rule unintentionally exposes brass (e.g., as a fill or border on a non-allowed element).

## Documentation Plan

- `docs/assets-needed.md` — LANDMARK-01 row update (`(deferred — archival)`).
- `docs/plans/2026-04-27-001-feat-songjeong-landmark-site-plan.md` — append a note in §Unit 8 referencing this refactor plan.
- README — no change (overall site behavior unchanged from the user's perspective; only internal structure shifts).

## Sources & References

- **Origin document:** [docs/plans/2026-04-27-001-feat-songjeong-landmark-site-plan.md](2026-04-27-001-feat-songjeong-landmark-site-plan.md) — original full-site plan that delivered LANDMARK as Unit 8 with 2-image stage decomposition.
- **Pattern parallel — labeled-timeline reveal:** `src/lib/motion/space.ts` (3-state crossing).
- **Pattern parallel — sequential progress-driven label state:** `src/lib/motion/day.ts` (4-frame time labels).
- **Pattern parallel — single-image frame layout:** `src/components/sections/Coast.astro` post-2026-04-28 refactor (centered editorial frame).
- **WCAG 2.3.3 vestibular guidance:** No motion >2× scale; image stays static throughout pin.
