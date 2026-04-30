---
title: Section Snap + Boundary Stack Transition + Indicator (Path B)
type: feat
status: active
date: 2026-04-29
supersedes:
  - docs/plans/2026-04-28-003-refactor-section-snap-navigation-plan.md
related:
  - docs/plans/2026-04-27-001-feat-songjeong-landmark-site-plan.md
---

# Section Snap + Boundary Stack Transition + Indicator (Path B)

## Overview

Add **page-by-page section feel** with a **stack-style depth transition** at section boundaries, while **preserving every existing in-section scrub effect** (DAY 4-frame cross-fade, LANDMARK 3-stage cross-fade, etc.).

The page stays on **native browser scroll** end-to-end. No wheel/touch/keyboard hijacking. No state machine. Snap is implemented as a GSAP ScrollTrigger snap-to-section-start configuration that activates only when the user's scroll velocity falls below a small threshold (i.e., when they stop). The stack visual is an additional pair of GSAP-scrubbed transforms applied at each section-pair boundary.

This is **Path B** from the 2026-04-29 feasibility discussion. It deliberately differs from the 2026-04-28-003 plan (full scroll hijack), which the user implemented and rolled back as "magnetic stutter."

## Problem Frame

The user is happy with the recent in-section motion craft (DAY scrub, LANDMARK 3-stage scrub, WINDOW video bg, SPACE crossing). Their remaining want is the *fullPage.js feel*: each section feels like a discrete page, transitions feel **fluid and immediate**, never like the input is being "grabbed" mid-scroll.

User's exact verbatim from 2026-04-29 session:

> "현재 내가 원하는 것들을 하나도 놓지 않고 완벽히 구현되었으면 함."
>
> "저렇게 바로바로 스크롤이 자연스럽지 않았었어 ... 그냥 저기는 너무나도 자연스럽게 각 섹션이 전환되었었는데, 우리는 애매하게 스크롤 되다가 멈칫, 전환? 마그네틱 느낌조금 났었고."

The 2026-04-28-003 attempt failed on the second part: it locked scroll out and ran a fixed 1.8s transition, which felt mechanical and "stuttery" rather than fluid. Path B inverts the relationship — scroll stays free at all times, snap only fires *after* the user has stopped scrolling, so there is no perceived input loss.

### Why this is different from Plan 003

| | Plan 003 (rolled back) | Path B (this plan) |
|---|---|---|
| Scroll input | Hijacked: wheel/touch/keyboard intercepted | Native: browser handles all input |
| Section advance | Discrete, 1 input → 1 advance | Continuous: user scrolls, snap finalizes the landing when they stop |
| In-section scrub | Removed (sections re-implemented as flat slides) | **Preserved** — DAY/LANDMARK keep current pin+scrub |
| Lenis | Stop()'d on activation | Already dead code; remains unused |
| Failure mode of 003 | "마그네틱 멈칙" — soft easing grabbed scroll mid-drag | Avoided by snap-on-rest, not snap-during-drag |

## Requirements Trace

| ID | Requirement | Source |
|----|---|---|
| R1 | Each non-pinned section snaps to its own viewport top after the user stops scrolling | "각 섹션이 전환되었었는데" + Path B selection |
| R2 | Pinned sections (DAY, LANDMARK) preserve their current scrub feel during their pin region; snap only at their start | User: "현재 내가 원하는 것들을 하나도 놓지 않고" |
| R3 | At each section pair boundary, outgoing section visibly recedes (scale ↓, opacity ↓, slight Y) while incoming section rises into place — "stack" depth | fullPage.js Stack effect reference |
| R4 | Snap must not feel "magnetic" — no soft pull during active scroll | User: "마그네틱 느낌조금 났었고" (negative signal) |
| R5 | Right-side section indicator (6 dots) shows current section; clicking a dot scrolls to that section with the same stack transition | Spec § 5 |
| R6 | `prefers-reduced-motion` and mobile fall back to plain native scroll without snap or stack transforms | WCAG, perf |
| R7 | bfcache compatibility maintained — no global wheel/touch listeners | Plan 002 institutional learning |

## Scope Boundaries

**In scope:**
- New module: section-snap (GSAP ScrollTrigger snap config)
- New module: section-stack (per-pair boundary scrubbed transforms)
- New (or extended) section indicator: right-side dots, click-to-jump
- Reduced-motion + mobile gating
- Tuning checklist for perceptual feel

**Explicitly out of scope (non-goals):**
- Wheel / touch / keyboard input hijacking
- Disabling native scroll
- Re-implementing DAY or LANDMARK as flat slides (their internal scrub stays)
- "Matrix" navigation as a separate horizontal-page-grid system on DAY (DAY's existing 4-frame scrub already plays the same role; we do not add an additional horizontal page mode)
- Re-activating Lenis or introducing any new smooth-scroll library
- URL hash sync per-stage (only top-level section anchors)
- License-bearing libraries (no fullPage.js)

If during implementation the user requests matrix-style horizontal navigation on DAY as a separate system, that is a follow-up plan. The current scrub on DAY satisfies the "multiple slides within section 3" intent visually.

## Context & Research

### Current state (2026-04-29)

- `src/lib/motion/engine.ts` — minimal LOADERS pattern, lazy-imports per-section motion modules. Current LOADERS: coast, landmark, day, window, space, address.
- `src/lib/motion/day.ts` — pinned, scrubbed 4-frame cross-fade across +=300% scroll. Snap **inside** the pin via internal labels (left intact).
- `src/lib/motion/landmark.ts` — pinned, scrubbed 3-stage cross-fade across +=300% scroll. Snap inside the pin via internal labels (left intact).
- `src/lib/motion/prologue.ts`, `space.ts`, `window.ts`, `address.ts` — non-pinned reveal/atmosphere modules.
- `src/lib/motion/nav-progress.ts` — exports `bindNavProgress(lenis)` but is **never called** anywhere (verified by grep). Dead path; we won't re-activate it.
- `src/components/Nav.astro` — already renders `.nav__sections` UL with one `.nav__link` per section, with `data-section` and `data-active` attributes, and an inline script that updates `data-active` based on `scrollY`. We extend this rather than create a parallel indicator.
- `package.json` — Lenis 1.1 listed as dependency but no runtime instantiation in `src/`. We do not import Lenis from new code; we may eventually drop the dep in a follow-up cleanup.

### Failure record from Plan 003 (institutional)

The 003 attempt mapped scroll pixels to discrete state-machine inputs and ran fixed-duration transitions. Quotes from the rejection:

- "스크롤이 잠겨서 답답" — scroll felt stuck
- "마그네틱이 잡아주는 그런 것이 아니라" — magnetic pull felt forced
- "갑자기 도착하면 툭 하면서" — abrupt arrival
- "내가 스크롤을 두 번 하면 두 번만큼 움직이잖아" — scroll-pixel coupling

The takeaway for Path B: **snap must fire on rest, not during scroll**, and motion at the boundary must remain scroll-driven (so two scrolls visibly do twice as much) right up until the user stops.

### External reference

- fullPage.js Stack scroll effect — visual target for the boundary depth animation (https://alvarotrigo.com/fullPage/scroll-effects/). We do not import the library.
- GSAP ScrollTrigger `snap` option (`snapTo`, `duration`, `delay`, `inertia`) — primary mechanism for R1 + R4.

## Key Technical Decisions

- **Snap engine: GSAP ScrollTrigger.snap with `delay` ≥ 100ms and short `duration` (max ~0.4s)**. The `delay` is what avoids the "magnetic" feel — snap only fires after scroll velocity has been near-zero for the delay window. `inertia: false` so the snap target is the *resting* nearest section, not a forward projection.

- **Snap targets: section-start Y values, computed dynamically**. For pinned sections (DAY, LANDMARK), the snap target is the section's pin start, not the pin end. The user scrolls into DAY → snap holds them at DAY top (= pin start) → they scroll through the pin freely → at pin end they exit → next snap target is LANDMARK top (= LANDMARK's pin start). No snap target inside a pin region.

- **Stack transition: per-pair scrubbed ScrollTrigger**. For each adjacent (outSection, inSection) pair, create a ScrollTrigger keyed to `outSection`'s **end** (pin end for pinned sections, section bottom for non-pinned). Range: `start: 'bottom 80%'` of `outSection`, `end: 'bottom top'`. Tweens:
  - `outSection`: `scale 1 → 0.94`, `opacity 1 → 0.65`, `y 0 → -3vh`, `transform-origin: 50% 50%`
  - `inSection`: `y 12vh → 0`, `opacity 0.7 → 1`
  - `scrub: true` so it tracks scroll directly. No magnetic ease.

- **Z-index layering for stack depth**: each `<section>` gets `position: relative; z-index: var(--section-z)`. Outgoing has lower z, incoming has higher z. Static layering (set in CSS), no JS toggling.

- **Indicator: extend existing Nav, do not duplicate**. Add a new `.nav__dots` block (right-side, position: fixed) that mirrors `.nav__sections`. Reuse the existing inline active-section scrollY tracker; add `click → scrollTo` for jump-to-section. Style spec: 6 dots, 0.35rem default, 0.55rem active, ivory @ 0.35 → ivory @ 1.0, gold accent (`#C9A96E`) optional but not required for v1.

- **Click-to-jump uses `gsap.to(window, { scrollTo: y })` not `element.scrollIntoView`**. ScrollTo plugin gives controlled duration (~700ms) and ease, and ScrollTrigger.snap plays nicely with it. Native `scrollIntoView({ behavior: 'smooth' })` does not fire ScrollTrigger.update at the right cadence.

- **No global wheel/touch listeners** anywhere in the new modules. R7 / bfcache compliance.

- **Reduced-motion gating**: in `setup()` of both new modules, return early if `shouldReduce()` is true. CSS does not need a separate reduced-motion path because the absence of JS = no transforms = sections behave as a flat scroll list.

- **Mobile gating**: snap is disabled on `breakpoint === 'mobile'` (touch users have weaker need for snap and snap-on-rest can fight pull-to-refresh / over-scroll bounce on iOS). Stack transition stays enabled on mobile (it's just transform on existing scroll, no input capture).

## Open Questions

### Resolved during planning

- *Will Lenis interfere with snap?* — No. Lenis is dead code. Confirmed by grep on `bindNavProgress` callers (zero) and `new Lenis(` (zero in src/).
- *Should DAY's 4-frame scrub be replaced with a fullPage.js-style horizontal slide grid?* — No. DAY's existing scrub satisfies the "multiple within section 3" intent. The user said "현재 내가 원하는 것들을 하나도 놓지 않고."
- *Should the new indicator replace `.nav__sections` in Nav.astro?* — No. Nav.astro shows top-bar nav links by name; the new right-side dots are a separate visual register. Both can coexist; data source for active state is shared.
- *fullPage.js or roll our own?* — Roll our own. License cost, Lenis-incompatibility, and rigid DOM structure all argue against fullPage.js. The Path B feature surface is small enough (snap + 5 boundary triggers + indicator) that a custom implementation is cleaner.

### Deferred to implementation

- **Exact snap delay/duration values** — start with `delay: 0.12, duration: { min: 0.2, max: 0.45 }, ease: 'power2.out'` and tune by perceptual feel during the verification unit. The 003 rollback was diagnosed as "magnetic"; deferring final tuning until the implementer can perceive scroll-rest behavior on real hardware is correct.
- **Boundary range for stack transition** — exact `start`/`end` percentages may need adjustment per section to avoid stack visuals colliding with the pin's anticipatePin region of DAY/LANDMARK. Tune per pair.
- **Indicator click delay vs. snap settle** — when indicator is clicked, the scrollTo animation should land the user at section start; we then explicitly disable ScrollTrigger.snap during the scrollTo to prevent double-correction. Exact API call deferred.
- **bfcache check after deploy** — confirm bfcache eligibility via DevTools Application > Back/Forward Cache Probe. Add to verification.

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
                native browser scroll (free at all times)
  ────────────────────────────────────────────────────────────►
  [coast]   [landmark────pin────]  [day────pin────]  [window]  [space──pin──]  [address]
     │          │                      │                 │         │              │
     │          ▼                      ▼                 │         ▼              │
     │     pin scrub                pin scrub            │      pin scrub         │
     │     (3-stage)                (4-frame)            │      (states)          │
     │                                                   │                        │
     ▼ ─── stack transition pair trigger ─────────────► (outgoing recedes)        │
              outSection: scale↓ opacity↓ y↑ │ inSection: y↑→0 opacity→1  ◄───────┘
                                                                                    
  Snap (delay 0.12s, max 0.45s, on rest):
    target list = [coastStart, landmarkPinStart, dayPinStart, windowStart, spacePinStart, addressStart]
    fires only when scroll velocity ≈ 0 for delay window
```

Key insight: snap delay > 0 is what separates "fluid" from "magnetic." `delay: 0` = grabby. `delay: 0.12s` = the user feels free until they stop, then it gently locks. The 003 attempt's mistake was hijacking input directly; we do the inverse — let scroll be free, lock only at rest.

## Implementation Units

- [x] **Unit 1: Right-side section indicator (DOM + CSS, isolated)**

**Goal:** Render a fixed right-side column of 6 dots, one per section, with active-state highlighting driven by the existing scrollY tracker in Nav.astro. No motion logic yet.

**Requirements:** R5

**Dependencies:** None

**Files:**
- Create: `src/components/SectionDots.astro`
- Modify: `src/layouts/BaseLayout.astro` (or wherever `<Nav />` is mounted) to also mount `<SectionDots />`
- Modify: `src/styles/nav.css` (or a new `src/styles/section-dots.css`) to style the dots
- Modify: `src/components/Nav.astro` — extract the active-section tracking script into a shared module so SectionDots can subscribe to the same active-id signal. Recommended location: `src/scripts/active-section.ts` (or inline within `SectionDots.astro` if the duplication is < 30 lines)

**Approach:**
- Dots list is data-driven from the same section list Nav.astro uses (consider exporting it)
- Active dot: scale + full ivory; inactive: 35% ivory
- Position: `position: fixed; right: clamp(1rem, 2vw, 1.5rem); top: 50%; transform: translateY(-50%)`
- z-index above sections, below nav
- Mobile: hide via `@media (max-width: 768px)` (mobile users use scroll position as their indicator)

**Patterns to follow:**
- `src/components/Nav.astro` for the section list shape and active-tracking script
- Existing CSS variable use for color (`--color-ivory`) and hairlines

**Test scenarios:**
- Dots render before any motion module loads
- Active dot updates as user scrolls (driven by existing scrollY tracker)
- Dots are hidden on `max-width: 768px`
- No console errors when `prefers-reduced-motion: reduce` is on (Unit 1 has no motion to gate)

**Verification:**
- All 6 dots visible on desktop; correct one highlights as user scrolls; column doesn't overlap any section content
- Hidden on mobile

---

- [x] **Unit 2: Section snap config (snap-on-rest)**

**Goal:** Activate GSAP ScrollTrigger snap that locks the user to the nearest section's start Y value when they stop scrolling, with a delay > 0 so the snap doesn't grab during active scroll.

**Requirements:** R1, R2, R4

**Dependencies:** None (independent of Unit 1)

**Files:**
- Create: `src/lib/motion/section-snap.ts`
- Modify: `src/lib/motion/engine.ts` — boot section-snap once after per-section LOADERS have mounted

**Approach:**
- Single ScrollTrigger configured with `snap`, `start: 0`, `end: 'max'`. The `snap` option is given a function that returns the array of section-start Y values (re-computed on resize via `invalidateOnRefresh`)
- For pinned sections (DAY, LANDMARK), the snap target = the section element's `offsetTop`, *not* the pin end. This is the natural top-of-viewport position before pin engages
- Snap initial config: `delay: 0.12`, `duration: { min: 0.2, max: 0.45 }`, `ease: 'power2.out'`, `inertia: false`, `directional: false`
- Gate: skip snap setup entirely when `shouldReduce()` or `mode === 'mobile'`

**Execution note:** Tuning is part of Unit 6. Land Unit 2 with sensible defaults; do not over-tune in this unit.

**Patterns to follow:**
- `src/lib/motion/landmark.ts` lines 50-65 for ScrollTrigger snap config shape
- `src/lib/motion/breakpoint.ts` and `reduced-motion.ts` for the gating helpers

**Test scenarios:**
- User mid-scroll: motion is uninterrupted; no pull during scroll
- User releases scroll near a section boundary: lands cleanly on the nearest section start within ~300ms
- Pinned section interior: snap does not fire during the pin region (verified by reading ScrollTrigger.getAll() and ensuring no snap target falls inside a pin's start–end span)
- Resize: ScrollTrigger.refresh recomputes targets correctly
- `prefers-reduced-motion: reduce`: setup is a no-op

**Verification:**
- Manually scroll through all 6 sections; each non-pinned section locks to top after release without "grabbing"
- Inside DAY's pin, scrolling drives the existing 4-frame cross-fade; no snap interference
- Inside LANDMARK's pin, the existing 3-stage cross-fade is unaffected

---

- [x] **Unit 3: Boundary stack transition**

**Goal:** At each adjacent section-pair boundary, animate the outgoing section's wrapper (scale, opacity, y) and the incoming section's wrapper (y, opacity) on a scrubbed scroll range so the visual reads as "stack depth."

**Requirements:** R3

**Dependencies:** Unit 2 (snap should be in place so boundary lands cleanly)

**Files:**
- Create: `src/lib/motion/section-stack.ts`
- Modify: `src/lib/motion/engine.ts` — boot section-stack after section-snap
- Modify: `src/styles/sections.css` — add `--section-z` ladder (`coast: 1, landmark: 2, day: 3, window: 4, space: 5, address: 6`) and `transform-origin: 50% 50%` baseline

**Approach:**
- Iterate adjacent section pairs from `main > section[id]`
- For each pair `(out, in)`, create one ScrollTrigger:
  - Trigger: `out`
  - Start: `bottom 90%` (when `out`'s bottom enters viewport bottom + 10vh of headroom)
  - End: `bottom top` (when `out`'s bottom leaves viewport top)
  - For pinned `out` sections, use the pin's end via `endTrigger` if needed so the stack visual fires at pin release, not at the un-pinned bottom of the pinned element
  - Scrub: true (no soft easing — direct scroll-driven)
  - Tween A on `out`: `scale: 1 → 0.94`, `opacity: 1 → 0.65`, `y: 0 → -3vh`
  - Tween B on `in`: `y: 12vh → 0`, `opacity: 0.7 → 1`
- Gate: skip on `shouldReduce()`. Mobile keeps stack (no input capture; just transform).

**Patterns to follow:**
- GSAP ScrollTrigger pair patterns; no existing local example, so reference the shape used in `landmark.ts` for trigger setup but without pin
- CSS `--section-z` ladder mirrors how `landmark.css` already uses `z-index: 6` for `.section__index`

**Test scenarios:**
- Cross every boundary forward: outgoing visibly recedes; incoming rises into place
- Cross every boundary in reverse: animation runs in reverse cleanly (scrub: true makes reverse free)
- Boundary near DAY's pin end: stack fires at the moment DAY un-pins, no double-stutter
- `prefers-reduced-motion: reduce`: transforms are not applied; sections render flat
- Resize: ScrollTrigger.refresh recomputes ranges; no stuck transforms

**Verification:**
- Visual: at each boundary, depth effect reads as "outgoing pushed back, incoming brought forward"
- No section is left with leftover transform after boundary (verify via DevTools computed styles when section is fully off-screen above)
- Snap from Unit 2 still lands at section start, not mid-stack-transition

---

- [x] **Unit 4: Indicator click-to-jump** (native smooth scroll path; consolidated into Unit 1's component script — no separate gsap ScrollTo needed because snap-on-rest does not fight `behavior: 'smooth'`)

**Goal:** Wire the section dots from Unit 1 so that clicking a dot scrolls the page to that section's start with the same snap + stack visuals firing naturally.

**Requirements:** R5

**Dependencies:** Unit 1, Unit 2

**Files:**
- Modify: `src/components/SectionDots.astro` (or its companion script) — add click handlers that compute target Y and call `gsap.to(window, { scrollTo: { y, autoKill: true }, duration: 0.7, ease: 'power2.inOut' })`
- Modify: `src/lib/motion/section-snap.ts` — expose a brief "snap-paused" hook so click-to-jump can disable snap during the scrollTo and re-enable on completion (avoids snap fighting the programmatic scroll)
- Possibly add: `gsap/ScrollToPlugin` registration in `section-snap.ts` or `engine.ts`

**Approach:**
- Click handler reads `data-section` from clicked dot, finds matching `<section>`, computes `offsetTop`, runs scrollTo
- During scrollTo: temporarily set the snap config's `delay` to a very large value (effectively disabling), restore on `onComplete`
- The boundary stack transition (Unit 3) runs naturally from the scrubbed scroll position, no extra wiring

**Patterns to follow:**
- GSAP ScrollToPlugin is the canonical way to drive `window.scrollTo` with timeline control

**Test scenarios:**
- Click dot for current section: no-op (or gentle re-snap to top)
- Click dot for distant section: scroll glides over intermediate sections, stack effects fire as we cross each boundary, lands at target
- Click during an active scroll: scrollTo overrides; user input takes precedence on next wheel/touch
- Reduced-motion: scrollTo with `duration: 0` instant jump

**Verification:**
- Each dot reaches the correct section
- Animation feels "guided" not stuttery
- Active dot updates correctly mid-jump

---

- [x] **Unit 5: Reduced-motion + mobile gating audit** (gating wired in Units 1-3 directly: SectionDots CSS hides on mobile + drops transitions under reduced-motion; section-snap returns early on `shouldReduce() || mode === 'mobile'`; section-stack returns early on `shouldReduce()`, kept on for mobile per plan decision)

**Goal:** Confirm both new modules and the indicator behave correctly under `prefers-reduced-motion: reduce` and on mobile (<= 768px).

**Requirements:** R6

**Dependencies:** Units 1–4

**Files:**
- Modify: `src/lib/motion/section-snap.ts` — verify reduced-motion no-op
- Modify: `src/lib/motion/section-stack.ts` — verify reduced-motion no-op + mobile-still-on
- Modify: `src/components/SectionDots.astro` (or its CSS) — verify mobile hide
- Modify: `src/styles/nav.css` or `section-dots.css` — `@media (prefers-reduced-motion: reduce)` clears any decorative motion

**Approach:**
- For each new module, the `setup()` early-return path is exercised by toggling DevTools "emulate reduced motion"
- Mobile snap intentionally disabled (touch + iOS over-scroll bounce + snap-on-rest = bad); document in module header comment

**Test scenarios:**
- `prefers-reduced-motion: reduce` on desktop: page scrolls naturally with no snap and no stack transforms; in-section scrub modules still respect their own reduced-motion handling
- 375px viewport: dots hidden, snap disabled, stack transforms still apply (subtle on mobile, no harm)
- Resize from desktop → mobile: ScrollTrigger.refresh runs; snap disables; no stuck transforms

**Verification:**
- DevTools "Reduced motion" toggle: page becomes completely flat; in-section animations follow each module's own reduced-motion path
- Mobile viewport: usable, no jank, no missing content

---

- [ ] **Unit 6: Tuning + perceptual verification**

**Goal:** Tune snap delay, snap duration, and boundary stack range against the user's "fluid, not magnetic" perceptual bar. Document the final values in the module header comments.

**Requirements:** R4 (this is the requirement most likely to need tuning)

**Dependencies:** Units 2, 3

**Files:**
- Modify: `src/lib/motion/section-snap.ts` — final values
- Modify: `src/lib/motion/section-stack.ts` — final values
- Modify: this plan file — record final values in a "Tuning Outcomes" appendix

**Approach:**
- Run the dev server, scroll through the page in three modes:
  1. **Quick burst** (single fast wheel scroll): should advance one section, snap on rest, no mid-scroll grab
  2. **Slow drag** (trackpad slow): should scrub continuously through sections; snap fires only after fingers leave the trackpad
  3. **Stop mid-section** (release scroll mid-way through a non-pinned section): should snap to the *nearer* section start within ~300–400ms
- Tuning knobs:
  - Snap `delay`: 0.08 → 0.20 (start at 0.12). Lower = more aggressive snap, risks grab feel. Higher = snap feels lazy.
  - Snap `duration.max`: 0.30 → 0.55 (start at 0.45). Lower = snappier landing. Higher = softer.
  - Stack `start: 'bottom X%'`: 80% → 95%. Lower (e.g., 80%) = more visible stack. Higher = subtler.
- Document final perceptual choice + rationale in module headers

**Test scenarios:** (perceptual, not automated)
- Forward scroll across all 5 boundaries
- Reverse scroll across all 5 boundaries
- Mid-section release in each non-pinned section
- Click-to-jump from each dot to each other dot

**Verification:**
- User confirms "fluid, not magnetic" feel
- No regression in DAY/LANDMARK in-section scrub
- bfcache eligibility check (DevTools > Application > Back/Forward Cache) reports eligible

## System-Wide Impact

- **Interaction graph:** ScrollTrigger globals are shared. Section-snap and section-stack triggers must be created **after** per-section pin triggers (DAY, LANDMARK) so pin spans are known and snap can avoid them. Engine.ts will boot in this order: per-section LOADERS → section-stack → section-snap.

- **Error propagation:** ScrollTrigger creation errors fall through engine.ts's existing per-loader try/catch. New modules add their own try/catch around setup. A failure in section-snap or section-stack should not break in-section scrubs.

- **State lifecycle risks:** ScrollTrigger.refresh on resize must run after snap targets are recomputed, otherwise targets point to stale Y values. Use `invalidateOnRefresh: true` and explicit `ScrollTrigger.refresh()` after window resize debounce.

- **API surface parity:** No new public API. Internal modules only.

- **Integration coverage:** Unit tests are not the right tool here (visual perceptual feel). Verification is via the manual matrix in Unit 6.

## Risks & Dependencies

- **R-1 (medium):** Snap-on-rest `delay` value may feel different across devices (mouse wheel vs Magic Trackpad vs Magic Mouse vs touchpad on Windows). Mitigation: Unit 6 tuning prioritizes the user's primary device first; if cross-device divergence becomes a real complaint later, add device-specific delay logic.

- **R-2 (medium):** Stack transition's outgoing-section transform on a *pinned* section (DAY, LANDMARK) interacts with GSAP's pin spacer. When a pin releases, the section element returns to natural flow, and applying scale/y on top can cause a 1-frame jump. Mitigation: anchor the stack ScrollTrigger to the pin's `endTrigger` via the section's own pin trigger reference (passed through), and animate the section's wrapper (not the pinned inner) when it's a pinned section.

- **R-3 (low):** Adding `transform: scale()` to a section can promote it to its own GPU layer. With 6 sections each with their own bg/video, total GPU memory could spike on weak devices. Mitigation: stack transforms are scrubbed and only active during the boundary range (not always-on); set `will-change: transform` only via JS during the active range, remove on completion.

- **R-4 (low):** bfcache: confirmed no global wheel/touch listeners; ScrollTrigger uses passive scroll listeners which are bfcache-safe. Verify in Unit 6.

- **R-5 (low):** Lenis dependency is dead code but still in package.json. Out of scope for this plan; flag for follow-up cleanup.

## Documentation / Operational Notes

- Module headers in `section-snap.ts` and `section-stack.ts` should explain the snap-on-rest design choice and why it is **not** the same as Plan 003's input-hijack approach. Future contributors will otherwise reach for fullPage.js again.
- After landing, update `MEMORY.md` (in plugin memory, if present) with the perceptual tuning outcome — specifically what `delay` value worked.

## Sources & References

- **Origin discussion:** 2026-04-29 session — feasibility tradeoff (Path A/B/C); user selected B with note "현재 내가 원하는 것들을 하나도 놓지 않고 완벽히 구현되었으면 함."
- **Superseded plan:** [docs/plans/2026-04-28-003-refactor-section-snap-navigation-plan.md](2026-04-28-003-refactor-section-snap-navigation-plan.md) — full hijack approach; rolled back. This plan is the explicit alternative.
- **External:** fullPage.js Stack scroll effect — visual reference only, https://alvarotrigo.com/fullPage/scroll-effects/
- **Code references:**
  - `src/lib/motion/engine.ts` — boot order pattern
  - `src/lib/motion/landmark.ts` — ScrollTrigger snap config example (for reference, not pattern to copy)
  - `src/components/Nav.astro` — active-section tracking pattern to extend
  - `src/lib/motion/breakpoint.ts`, `reduced-motion.ts` — gating helpers
