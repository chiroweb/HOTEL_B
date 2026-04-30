---
title: Refactor to Section-Snap Navigation Architecture
type: refactor
status: active
date: 2026-04-28
origin:
  - docs/brainstorms/2026-04-27-songjeong-landmark-brief.md
  - docs/plans/2026-04-27-001-feat-songjeong-landmark-site-plan.md
supersedes:
  - docs/plans/2026-04-28-002-refactor-scroll-driven-entrance-grammar-plan.md
---

# Refactor to Section-Snap Navigation Architecture

## Overview

Replace the current scroll-driven entrance grammar (and the four prior rejected attempts) with a **section-snap navigation controller**: native page scroll is disabled on desktop; one wheel/touch/keyboard input advances the page by exactly **one section** through a fixed ~1.7s eased GSAP transition; further inputs are ignored while a transition is in flight; arrival is magnetic (no half-states).

The page becomes a controlled stage where scroll input is a discrete state-machine signal — not a progress driver.

## Problem Frame

The user has now rejected **five** successive motion grammars across this redesign cycle, each time describing the failure mode in different words. Decoded, every failure stems from the same root cause: scroll pixels were being mapped — directly or indirectly — to motion progress. The user's actual mental model is:

> *"각 섹션에서 스크롤을 한다. 전환이 된다. 전환 중에는 스크롤이 먹지 않는다. 전환 이후 다시 스크롤이 가능하게 된다. 이것이 내가 원한 것이다."*
>
> "In each section: I scroll. A transition fires. During the transition, scroll is locked out. After the transition, scroll works again. That's what I wanted."

And:

> *"그냥 한 1.8초 정도에 거쳐 다음 섹션으로 이동 이후 도착 이런 느낌은 어때? 마그네틱으로 고정되고."*
>
> "How about ~1.8s for the move-to-next-section then arrival, magnetic landing."

This is **fullPage.js / Apple iPhone-product-page style** section-snap navigation. Scroll is a *trigger*, not a *progress driver*. Multiple scrolls in one section don't fast-forward, don't rewind, don't add any pixel-bound effect — they're either ignored (during transition) or queued/debounced (between transitions).

### Why every prior attempt failed at the same point

| # | Grammar | Rejection signal |
|---|---------|------------------|
| 1 | Pin + scrub horizontal track (DAY) | "스크롤이 잠겨서 답답" — scroll felt stuck |
| 2 | 100svh vertical snap stack | "그냥 나열" — felt like a list, no transition between |
| 3 | Pin + scrub + cross-transition + snap labels | "마그네틱이 잡아주는 그런 것이 아니라" — too forceful in the wrong way |
| 4 | Lock + autoplay (2s per frame) | "갑자기 도착하면 툭 하면서" — section snapped first, *then* animation started → abrupt |
| 5 | ScrollTrigger scrub-on-entry | "내가 스크롤을 두 번 하면 두 번만큼 움직이잖아" — scroll-pixel coupling, the original sin |

Five rejections of variants of the same family (scroll-pixel-coupled motion). The user's intent was never inside that family — it was always section-snap with discrete inputs and self-running transitions.

### The miscommunication that kept us there

The phrase *"스크롤은 트리거"* (scroll is a trigger) sounds like ScrollTrigger semantics, where "trigger" means *"the scroll position that starts the timeline"*. The user meant *"scroll input is a state-machine input event"* — like a keystroke that advances slide N to slide N+1. Two completely different mental models, identical surface phrase.

## Requirements Trace

| ID | Requirement | Source (verbatim where possible) |
|----|-------------|------|
| R1 | One scroll-down input → exactly one section advance, regardless of subsequent scroll velocity or repetition | *"내가 한 섹션에서 스크롤을 몇 번을 하던 그냥 다음 섹션으로 부드럽게 넘어가야"* |
| R2 | Transition is a fixed-duration eased animation (~1.6–1.8s desktop), not coupled to scroll | *"한 1.8초 정도에 거쳐 다음 섹션으로 이동 이후 도착"* |
| R3 | During transition, scroll input is ignored | *"전환 중에는 스크롤이 먹지 않는다"* |
| R4 | After transition completes, scroll input works again (next advance) | *"전환 이후 다시 스크롤이 가능하게 된다"* |
| R5 | Magnetic landing — section is precisely positioned, no half-states | *"마그네틱으로 고정되고"* |
| R6 | DAY's 4 sub-frames each get the same first-class treatment as a top-level section in the snap chain | *"섹션 내부의 3-2, 3-3, 3-4 또한 동일하게 그러나 오른쪽에서 등장하길 바랬어서"* |
| R7 | HERO (COAST) loads with all content already in final state — NO entrance animation on first paint | *"히로 섹션은 모든 컨텐츠가 로딩 된 상태에서 시작하자"* |
| R8 | Photo / image arrival on each section enters from the right (or corner-aware for DAY) | Earlier session: *"오른쪽에서 자연스럽게 넘어오며 도착"* |
| R9 | Reverse navigation works (scroll-up returns to previous section with the same magnetic feel) | Implicit from "section-snap" intent + standard nav UX |
| R10 | Mobile + reduced-motion: respect free / native scroll. Don't trap touch users in a locked stage | Prior session decision: *"모바일에서는 기본 스크롤 가능하도록"* + WCAG 2.3.3 |
| R11 | Keyboard accessibility: ↓ ↑ PageDown PageUp Home End Space all advance/reverse the section chain | A11y baseline + WCAG 2.1.1 |
| R12 | LANDMARK currently empty — exclude from snap chain until redesign content lands | Prior session: *"섹션 2 비워둬"* + S188 |
| R13 | SPACE retains its hover-driven sub-category gallery within s2 | Prior session decision (preserved across all rewrites) |

## Scope Boundaries

**In scope:**
- New `section-nav` controller (input listening, state machine, transition orchestration)
- New `section-chain` registry (single source of truth for the section sequence)
- CSS layout lockdown (desktop: fixed-position stage; mobile/reduced: native scroll-snap)
- Per-section `enterTimeline` / `exitTimeline` factories on each motion module
- Removal of Lenis (smooth wheel scroll incompatible with section-snap stage)
- Removal of ScrollTrigger pin/scrub configurations across all sections
- Removal of `scrub-reveal.ts` (helper from plan 002, now obsolete)
- Removal of `snap.ts` (Lenis snap, no longer applicable)
- DAY 4 sub-frames become 4 entries in the section chain
- SPACE s1 / s2 become 2 entries in the section chain
- HERO (COAST) initial state becomes the post-entrance final state
- Address final-section behavior

**Out of scope:**
- LANDMARK redesign (still empty, separate plan when content arrives)
- Visual / typography / image asset changes
- Pagination dot UI on the right edge (defer; can be added later as a passive listener on chain state)
- URL hash / deep-linking to sections (defer)
- New copy / category data
- Page-load skeleton or loading state (existing IntersectionObserver lazy-import preserved)

## Context & Research

### Local research

**Current relevant code:**
- `src/lib/motion/engine.ts` — Lenis × GSAP boot, lifecycle gates (bfcache, breakpoint, reduced-motion), `SNAP_TARGETS` for Lenis snap. Heavy rewrite required.
- `src/lib/motion/scrub-reveal.ts` — Plan 002's helper. **DELETE.**
- `src/lib/motion/snap.ts` — Lenis snap wrapper with try/catch addElement. **DELETE.**
- `src/lib/motion/auto-play.ts` — already deleted in plan 002.
- `src/lib/motion/day.ts` `window.ts` `space.ts` `prologue.ts` — all rewrite to expose `enterTimeline()` / `exitTimeline()` factories.
- `src/lib/motion/registry.ts` — module registration with breakpoint mode awareness. Keep, but it now drives section-nav controller wake/sleep.
- `src/lib/motion/breakpoint.ts`, `reduced-motion.ts`, `bfcache.ts` — lifecycle gates. Keep as-is.
- `src/components/sections/Day.astro` — 4 articles with `id="day-morning"` etc. Each becomes a chain entry.
- `src/components/sections/Coast.astro`, `Window.astro`, `Space.astro`, `Address.astro`, `Landmark.astro` — section components. Markup mostly preserved; positioning class added.
- `src/styles/*.css` — per-section CSS. Switch from natural-flow to fixed-stage layout (desktop) with media-query fallback to natural flow (mobile / reduced).
- `src/components/Nav.astro` — existing top-nav with section dots. Wire its dot click handlers to the new controller's `goTo(i)`.

**Key institutional learnings to honor:**
- *S188*: GSAP pin math + Lenis snap = cumulative drift → resolved here by removing both.
- *S187*: silent failures from `snap.addElement` were a real problem → no longer relevant once Lenis is gone, but the lesson (surface failures, don't swallow) carries.
- *Lazy IntersectionObserver(rootMargin:50%)*: still useful for module mount, but section-nav needs all modules registered before first input — switch to eager-load on boot for the few motion modules we ship (≤5KB total compressed).
- *iOS Safari snap-cache flush (WebKit Bug 245722)*: not relevant once we drop CSS scroll-snap on the desktop path. Mobile path may still need it.

### External research

Skipped. Section-snap navigation (fullPage.js, Slick, Swiper) is a well-established pattern with 15+ years of public reference implementations. The codebase already has GSAP timelines and lifecycle gating; the new controller is application-level orchestration, not a framework integration risk. No version-specific concerns.

### Mental model — the "착착" beat (corrected)

```
Idle@0  ───wheel-down──▶  Transitioning(0→1)  ───~1.7s eased───▶  Idle@1
                              │
                              │ extra wheel inputs ignored
                              │ extra touch inputs ignored
                              │ extra keys ignored
                              ▼
                          (no effect)

Idle@1  ───wheel-up────▶  Transitioning(1→0)  ───~1.7s eased───▶  Idle@0
                              │
                              │ same lock contract
                              ▼
```

The "착착" rhythm is the cadence of **discrete inputs through a sequence of stable states**, each transition self-contained and self-paced. Not a continuous scroll mapped to a continuous animation.

## Key Technical Decisions

### D1: Section-snap state machine (fullPage.js-style)

State: `{ currentIndex: number, status: 'idle' | 'transitioning', cooldownUntil: number }`

Inputs accepted only when `status === 'idle'` AND `Date.now() >= cooldownUntil`:
- Wheel: `deltaY > THRESHOLD` → next; `deltaY < -THRESHOLD` → prev
- Touchend: `(startY - endY) > THRESHOLD` → next; `(endY - startY) > THRESHOLD` → prev
- Keys: ↓/PageDown/Space → next; ↑/PageUp → prev; Home → first; End → last
- Public API: `goTo(index)` for nav UI / hash / external trigger

On accepted input:
1. `status = 'transitioning'`
2. Build composite transition timeline = `exitTimeline(curr)` ∥ `enterTimeline(next)` running in parallel, both 1.7s, both eased, total wall-clock = 1.7s
3. `onComplete`: `currentIndex = next; status = 'idle'; cooldownUntil = now + 150ms`

The 150ms cooldown absorbs trackpad inertia (a single physical swipe on a Mac trackpad emits 30–60 wheel events tail-tailing for ~200–500ms; we ignore them all because (a) we're transitioning, then (b) we're cooling down).

### D2: Fixed-stage layout (desktop) with native fallback (mobile / reduced)

Desktop `<html data-stage="locked">`:
- `html, body { height: 100%; overflow: hidden; }`
- `<main>` is `position: relative; height: 100svh; overflow: hidden`
- Each section: `position: absolute; inset: 0; will-change: transform, opacity; pointer-events: none`
- Active section: `pointer-events: auto`
- Stack order via DOM order; transition handles z-index temporarily

Mobile / reduced-motion `<html data-stage="free">`:
- `html, body` natural overflow
- `<main>`: `scroll-snap-type: y mandatory`
- Each section: `position: relative; min-height: 100svh; scroll-snap-align: start`
- No JS transitions; per-section motion modules degrade to `top 75%` once-fire entrance reveals (existing pattern from `scrub-reveal` short-circuit, ported into each module)

The `data-stage` attribute toggles via JS at boot based on `currentMode()` + `shouldReduce()` + breakpoint listener. CSS keys all locked-stage rules off `[data-stage="locked"]`.

### D3: Per-module enter / exit timeline factories

Each motion module exports `enterTimeline(el)` and `exitTimeline(el)` returning paused GSAP timelines.

- `enterTimeline(el)`: section incoming. Default shape: photo / image slides in from right (`x: +120px → 0`), copy / overlays fade up (`y: +24px → 0, opacity: 0 → 1`), staggered. Total inner duration ≤ 1.6s; controller overrides duration to exactly 1.7s via `tl.duration(1.7)` on dispatch.
- `exitTimeline(el)`: section outgoing. Default shape: photo / image slides to left (`x: 0 → -120px`), copy fades out, slight scale-down (0.99). Total ≤ 1.6s.

Inverse direction (going backwards in chain): controller swaps — calls `enterTimeline` of (prev) to play in *reverse* and `exitTimeline` of (curr) in *reverse*. Equivalent visual: the photo "comes back from the left" and previous section's photo "returns to right". This means each module only writes the forward timelines; reverse is mechanical.

### D4: Section chain (single source of truth)

A single registry array drives the controller, the nav UI, and the lazy-load manifest:

```ts
type ChainEntry = { id: string; element: HTMLElement; module: MotionModule };
```

Order: `coast → day-morning → day-surf → day-walk → day-light → window → space-s1 → space-s2 → address`

LANDMARK currently excluded (R12). When LANDMARK content arrives, insert at index 1.

SPACE is split into two chain entries (`space-s1`, `space-s2`) sharing the same DOM element. The motion module exposes two pairs of enter/exit factories — one per state. Hover-driven sub-category swap (R13) operates within `space-s2` idle state only.

### D5: 1.7s default duration; reduced-motion = 0.4s crossfade only

User suggested ~1.8s. I'm picking 1.7s as the default — close enough to honor the request, slightly under the round number to feel responsive rather than ponderous. Easing: `cubic-bezier(0.22, 1, 0.36, 1)` — same as the rest of the site (slow-out, magnetic settle).

Reduced-motion path on desktop (rare — user with reduced-motion preference but on desktop) uses controller with 0.4s opacity-only crossfade, no slide. WCAG 2.3.3 compliance.

Mobile reduced-motion: same as mobile default (native scroll, no controller).

### D6: Remove Lenis entirely

Lenis is incompatible with `overflow: hidden` on `html` (its smooth wheel handler depends on a scrollable host). On the mobile / reduced path we use native scroll-snap, which is also incompatible with Lenis (Lenis README explicitly forbids combining the two).

This means:
- Delete `import Lenis from 'lenis'` from engine.ts
- Delete `lenis.raf` ticker integration
- Delete the `lenis.on('scroll', ScrollTrigger.update)` hookup
- Remove `lenis` from `package.json`
- Update bfcache stop/start logic (just controller pause/resume)

Net: `engine.ts` shrinks dramatically. Lenis' job (smoothing wheel input, providing scroll position) is replaced by the controller's discrete state machine on desktop and native browser scroll on mobile.

### D7: Remove ScrollTrigger pin/scrub usage; keep gsap.timeline

`ScrollTrigger` is imported but most of its features (pin, scrub, scrubbing tweens, scroll-bound triggers) become unused. Two options:
- (a) Drop the `gsap/ScrollTrigger` import entirely (saves ~30KB compressed)
- (b) Keep it for niche utilities (e.g., `ScrollTrigger.refresh()` after font-load) even though no triggers exist

**Choose (a)** — fully drop ScrollTrigger. Font-load reflow doesn't matter on the locked stage (sections are absolutely positioned and don't shift). The mobile fallback uses pure CSS scroll-snap, also no ScrollTrigger needed.

Saves bundle size, reduces lifecycle complexity.

### D8: HERO loads in final state (no entrance reveal)

R7 explicit. PROLOGUE module no longer has an entrance timeline that runs on mount or first scroll. The page paints with all hero content (mono label, frame, display heading, ko line, pause control) already at final position / opacity. Backdrop image and video mount as they do today.

PROLOGUE module's `enterTimeline` is reserved for the *coming-back-from-section-1* case (user scrolled forward, then back to section 0). On first paint, the timeline is in its post-completion state.

### D9: Keyboard navigation does NOT trap focus

Arrow keys / PageDown / PageUp on the document advance the section chain. But `Tab` continues to move between focusable elements within the active section (links, buttons, the pause-control). This separation is critical for screen-reader and keyboard-only users.

Implementation: section-nav listens on `window` for arrow / page / space / home / end. Tab is unaffected — it bubbles natively through focusable elements. We do NOT call `preventDefault` on Tab.

### D10: Resize / breakpoint flip handling

On window resize across the mobile/desktop breakpoint:
- Stop the active controller (locked → free) or start one (free → locked)
- Migrate `data-stage` attribute
- Reset `currentIndex` to whichever section's top is closest to viewport center (preserve user's place)
- Re-mount per-section enter timelines into final state

Existing `onBreakpointChange` callback drives this; engine.ts already wires it. The new controller registers a teardown / boot function with the breakpoint listener.

## Open Questions

### Resolved during planning

- **Q: 1.7s vs user's "~1.8s"?** A: 1.7s default; expose as a constant for trivial tuning. User will tell us "느려" or "빨라" within first 30 seconds of use.
- **Q: Mobile section-snap navigation?** A: Native CSS scroll-snap, NOT controller. Honors R10 (free scroll) + WCAG 2.3.3 + matches platform expectation.
- **Q: LANDMARK index?** A: Excluded from chain entirely while empty. Content arrival reinstates it.
- **Q: SPACE s1/s2 — separate sections in chain or one section with internal pin?** A: Separate sections (D4). Eliminates the only remaining pin in the codebase, gives s2 its own scroll budget, lets hover gallery operate cleanly.
- **Q: ESC behavior during transition?** A: ESC fast-forwards the timeline (`tl.progress(1)` → `onComplete` fires immediately). Same a11y safety as the deleted lock+autoplay grammar.
- **Q: Wheel debounce window?** A: 150ms post-transition cooldown + bool flag during transition. Trackpad inertia (commonly 300–500ms tail) is fully absorbed.
- **Q: Touch threshold?** A: 50px vertical delta. Below threshold → ignore (passive vertical scroll attempt absorbed). Above threshold + direction unambiguous → fire.
- **Q: What happens if a transition is requested with target = currentIndex?** A: No-op. `goTo(curr)` returns early.
- **Q: Stack z-index during transition?** A: Outgoing section gets z-index 1, incoming gets z-index 2. After transition: both reset to 0 (active gets `pointer-events: auto`, others `none`).
- **Q: Bundle size savings from dropping Lenis + ScrollTrigger?** A: Lenis ≈ 8KB gzipped; ScrollTrigger ≈ 25KB gzipped. Total ~33KB shaved.
- **Q: Does Nav.astro's dot UI need rework?** A: Minor — its click handlers currently use `scrollIntoView`. Replace with `sectionNav.goTo(i)`. Active dot logic now subscribes to chain state.

### Deferred to implementation

- Exact easing tuning (cubic-bezier(0.22, 1, 0.36, 1) is the starting point; verify "magnetic" feel in browser, may want slightly more aggressive slow-out)
- Touch threshold tuning (50px → may want 70px on tall mobile screens)
- Whether to add a tiny "transitioning" loading hint (probably not — 1.7s is fast enough that any indicator would just flash)
- Whether to debounce keyboard repeat-key (holding ↓): probably yes, same cooldown gate
- Whether HERO should fade-in on initial paint (not animate — just respect `prefers-reduced-data` to skip the video) — defer
- Whether section-nav should expose a state to React-style devtools / HMR overlay (defer; not a v1 concern)

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

### State machine

```
                       ┌──────────────┐
                       │ Idle @ i     │
                       │ (section i   │
                       │  fully       │
                       │  visible)    │
                       └──┬───────┬───┘
        wheel-down         │       │         wheel-up
        / ↓ / PgDn         │       │         / ↑ / PgUp
        / swipe-up         │       │         / swipe-down
                           ▼       ▼
                  ┌──────────────────────┐
                  │ Transitioning        │  ← all inputs ignored
                  │ (i → i+1)  or        │  ← cooldown 150ms after
                  │ (i → i−1)            │     completion
                  │                      │
                  │ • exitTimeline(i)    │
                  │   in parallel with   │
                  │   enterTimeline(i±1) │
                  │ • duration: 1.7s     │
                  │ • ease: cb(0.22,1,   │
                  │         0.36,1)      │
                  └──────────┬───────────┘
                             │ onComplete
                             ▼
                       ┌──────────────┐
                       │ Idle @ i±1   │
                       └──────────────┘

Edge cases:
  • Idle@0 + wheel-up    → no-op (chain start)
  • Idle@N + wheel-down  → no-op (chain end)
  • ESC during transition → tl.progress(1) → onComplete fires now
  • Resize crosses bp    → controller swap (locked ↔ free)
  • bfcache pagehide     → controller stop + state freeze
  • bfcache pageshow     → controller start + restore state
```

### Section chain (current — LANDMARK excluded)

```
  ┌───────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
  │ COAST │→│ DAY-MOR │→│ DAY-SURF│→│ DAY-WALK│→│ DAY-LIGHT│→│ WINDOW │→│ SPACE-S1│→│ SPACE-S2│→│ ADDRESS │
  │   0   │  │    1    │  │    2    │  │    3    │  │    4    │  │   5    │  │    6    │  │    7    │  │    8    │
  └───────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └────────┘  └─────────┘  └─────────┘  └─────────┘

  9 stops total. LANDMARK reinserts at index 1 when content lands.
```

### Per-section transition shape (default)

```
Outgoing (exit):                Incoming (enter):

  photo: x  0  →  -120px         photo: x  +120px →  0
  photo: opacity 1 →  0          photo: opacity  0 →  1
  copy:  y  0  →  -16px          copy:  y  +24px  →  0
  copy:  opacity 1 →  0          copy:  opacity  0 →  1
  scale: 1     →  0.99           (no scale change)

  Both timelines run in parallel for 1.7s, eased.
  Net visual: outgoing slides off-left, incoming slides in from right,
  briefly overlapping in the middle of the transition.
```

DAY frames use corner-aware enter direction (tr/br = +120px right, tl/bl = -120px left), preserving the diamond rotation visual identity. SPACE s1→s2 uses a tighter, slower transition (image translates left in s2 to make room for category list).

### Pseudo-code: controller core

```text
sectionNav.boot({ chain }):
  state = { i: 0, status: 'idle', cooldownUntil: 0 }
  bind wheel/touch/keys on window
  call chain[0].module.enterTimeline(...).progress(1)  // section 0 starts in final state
  for each j in 1..chain.length-1:
    chain[j].module.enterTimeline(...).progress(0)     // others held at pre-enter

sectionNav.tryAdvance(direction):
  if state.status !== 'idle': return
  if Date.now() < state.cooldownUntil: return
  next = state.i + direction
  if next < 0 || next >= chain.length: return
  state.status = 'transitioning'
  exit = chain[state.i].module.exitTimeline(...).duration(DURATION)
  enter = chain[next].module.enterTimeline(...).duration(DURATION)
  parallel = gsap.timeline()
    .add(exit, 0)
    .add(enter, 0)
  parallel.eventCallback('onComplete', () => {
    state.i = next
    state.status = 'idle'
    state.cooldownUntil = Date.now() + COOLDOWN_MS
  })
  parallel.play()
```

## Implementation Units

- [ ] **Unit 1: Section chain registry**

**Goal:** Establish a single source of truth for the section sequence (id, element, module) that drives the controller, nav UI, and lazy-load.

**Requirements:** R1, R6, R12, R13

**Dependencies:** None (foundational)

**Files:**
- Create: `src/lib/motion/section-chain.ts`
- Modify: `src/components/Layout.astro` or wherever sections are rendered (add stable `data-section` attributes if missing)

**Approach:**
- Export `buildChain()` that scans the DOM for sections in order, matches them to motion modules by `id`, and returns the typed chain array.
- Order is DOM order — no manual list to keep in sync.
- LANDMARK excluded if its element has no children (heuristic) OR has `data-empty` attribute (explicit).
- DAY's 4 sub-frames are individual entries (each `.day-frame` becomes a chain entry with synthetic ID `day-morning` etc., matching existing IDs).
- SPACE produces two entries (`space-s1`, `space-s2`) that share the same element but bind different enter/exit factories.

**Patterns to follow:**
- `src/lib/motion/registry.ts` typing style.
- Existing module registration pattern: each module ships a `MotionModule` object with `id` and `init(el, mode)`.

**Test scenarios:**
- Chain length on initial DOM = 9 (with LANDMARK excluded).
- Chain length = 10 after LANDMARK markup gains content.
- Each chain entry resolves a real DOM element + non-null module.
- Reordering DOM reorders chain (no hard-coded list).

**Verification:**
- `console.log(buildChain().map(c => c.id))` returns `['coast', 'day-morning', 'day-surf', 'day-walk', 'day-light', 'window', 'space-s1', 'space-s2', 'address']`.

---

- [ ] **Unit 2: Section-nav controller**

**Goal:** Implement the state machine, input listeners, and transition orchestration.

**Requirements:** R1, R2, R3, R4, R5, R9, R11

**Dependencies:** Unit 1

**Files:**
- Create: `src/lib/motion/section-nav.ts`
- Test: manual verification (no test harness in repo). Key invariants documented in test scenarios below.

**Approach:**
- State: `{ index, status, cooldownUntil }` — module-private, exposed via subscribe API.
- Inputs:
  - `wheel`: passive listener; uses `Math.abs(deltaY) > Math.abs(deltaX)` to filter horizontal trackpad drift; threshold = 8px to debounce micro-twitches.
  - `touchstart` + `touchend`: track Y delta; threshold = 50px; ignore if duration < 80ms (treat as tap).
  - `keydown`: ↓ / PageDown / Space → next; ↑ / PageUp → prev; Home → 0; End → last. Always `preventDefault` for these. Tab unaffected.
- `goTo(targetIndex)`: public API. Computes direction. Runs full transition even for skip-to (long-distance jumps OK, single transition).
- Transition: composite `gsap.timeline()` with parallel `exitTimeline(curr)` + `enterTimeline(next)`, both forced to `DURATION = 1.7`. ESC handler fast-forwards via `tl.progress(1)`.
- Cooldown: `Date.now() + 150` after `onComplete`.
- Subscribe API: `sectionNav.onChange(cb)` for nav UI to update active dot.
- Teardown: cancel listeners, kill in-flight timeline, reset state.

**Patterns to follow:**
- Lifecycle / cleanup style of `src/lib/motion/engine.ts`.
- `gsap.timeline()` parallel composition (already used in `space.ts`).

**Test scenarios:**
- Wheel-down once → advances by 1.
- Wheel-down 10x rapidly during transition → still advances by 1.
- Wheel-down at last section → no-op.
- Touch swipe up 80px → next.
- Touch tap (no significant Y delta) → no-op.
- ↓ key → next; PageDown → next; Home → 0; End → last.
- ESC during transition → completes immediately; cooldown still applies.
- `goTo(5)` from index 0 → single 1.7s transition lands on 5 (not 5 sequential transitions).
- Subscribe callback fires on every state change (idle → transitioning → idle).

**Verification:**
- Manually: page transitions section by section with discrete inputs.
- No "scroll-stuck" feel; no "툭"; no pixel-mapped motion.
- Trackpad inertia produces exactly one advance per intentional swipe.

---

- [ ] **Unit 3: Stage CSS lockdown**

**Goal:** Switch desktop layout to fixed-stage; preserve mobile/reduced-motion native scroll-snap.

**Requirements:** R1, R10

**Dependencies:** Unit 1, Unit 2

**Files:**
- Modify: `src/styles/global.css` (or `tokens.css` / `reset.css` — wherever `html, body` rules live)
- Modify: every per-section CSS file (`prologue.css`, `day.css`, `window.css`, `space.css`, `address.css`)
- Touch: `src/components/Layout.astro` (add `<html data-stage="…">` initialization OR set in JS at boot)

**Approach:**
- New CSS scope: `[data-stage="locked"]` (desktop default).
  - `html, body { height: 100%; overflow: hidden; }`
  - `<main>` host: `position: relative; height: 100svh; overflow: hidden;`
  - Each section: `position: absolute; inset: 0; pointer-events: none;`
  - `.section--active`: `pointer-events: auto;`
- New CSS scope: `[data-stage="free"]` (mobile / reduced).
  - `html, body` natural overflow
  - `<main> { scroll-snap-type: y mandatory; -webkit-overflow-scrolling: touch; }`
  - Each section: `position: relative; min-height: 100svh; scroll-snap-align: start; scroll-snap-stop: always;`
- Default attribute = `locked` on desktop; section-nav controller boot sets it to `free` if `mode === 'mobile' || shouldReduce()`.
- DAY's `.day-frame` becomes `position: absolute; inset: 0` under locked stage (each frame is its own chain entry, only one visible at a time). Under free stage, the existing 100svh stack works.

**Patterns to follow:**
- Existing media query pattern in `day.css` for mobile collapse.
- `data-snap-fallback` attribute pattern in `engine.ts` (already used for reduced-motion).

**Test scenarios:**
- Desktop fresh load: `<html data-stage="locked">`. Section 0 visible, others not.
- Resize to ≤768px: `data-stage="free"`. All sections visible in natural flow.
- `prefers-reduced-motion: reduce`: `data-stage="free"` regardless of breakpoint.
- DAY sub-frames in locked stage: only the active frame's photo visible.

**Verification:**
- DevTools: only one section has `pointer-events: auto` at a time on desktop.
- No horizontal scroll bar appears.
- Mobile real device: native snap-snap rhythm matches default scroll feel.

---

- [ ] **Unit 4: PROLOGUE — final-state initial paint + enter/exit factories**

**Goal:** Hero loads with all content already settled (R7); module exposes timeline factories for re-entering and exiting via the controller.

**Requirements:** R7, R8, R9

**Dependencies:** Unit 2, Unit 3

**Files:**
- Modify: `src/lib/motion/prologue.ts`

**Approach:**
- Remove the existing entrance reveal (the on-mount or scrub-driven `from()` calls).
- Initial state in CSS: all hero elements at final position / opacity 1.
- Export `enterTimeline(el)`: photo / heading slide in from right (used when user scrolls back from DAY-MOR to COAST). On first load, controller calls `enterTimeline().progress(1)` to materialize the final state without flash.
- Export `exitTimeline(el)`: outgoing slide-left + fade.
- Video mount logic preserved (still post-window.load lazy mount).
- Pause control preserved.

**Patterns to follow:**
- `gsap.context()` cleanup pattern.
- Pause-control wiring (lines 88–168 of current prologue.ts) — unchanged.

**Test scenarios:**
- First paint: hero text in final position, frame visible, mono label visible. No animation runs.
- After scrolling to DAY then scrolling back: hero re-enters via `enterTimeline` — same visual treatment as if it was incoming for the first time.
- Pause control still toggles video.
- Reduced-motion path: enterTimeline = opacity-only crossfade (no slide).

**Verification:**
- Lighthouse LCP element (hero heading) paints with 0ms delay from first paint.
- No console errors on initial load.
- Reverse navigation triggers a clean re-entrance.

---

- [ ] **Unit 5: DAY — 4 sub-frames as chain entries with corner-aware enter direction**

**Goal:** Each DAY sub-frame becomes a first-class chain entry. Photo enters from its corner-aware direction (R6, R8). Diamond rotation visual preserved.

**Requirements:** R5, R6, R8, R9

**Dependencies:** Unit 1, Unit 2, Unit 3

**Files:**
- Modify: `src/lib/motion/day.ts`
- Modify: `src/styles/day.css` (each frame becomes `position: absolute; inset: 0` under locked stage)
- Touch: `src/components/sections/Day.astro` (verify each `.day-frame` has stable `id` matching chain expectation)

**Approach:**
- Module exposes a *factory function* `dayFrameFactory(frame, position)` returning `{ enterTimeline, exitTimeline }` for a single frame.
- `section-chain.ts` calls this factory once per `.day-frame` to produce 4 chain entries.
- Photo enter origin: `slideOriginX(position)` = +120 for tr/br, -120 for tl/bl. Photo arrives "home" to its corner.
- Float drift: y +24 → 0, opacity 0 → 1, slightly delayed (0.2s into 1.7s timeline).
- Copy fade: y +18 → 0, opacity 0 → 1, more delayed (0.4s into timeline).
- Mobile / reduced fallback: each frame collapses to natural-flow with `top 75%` once-fire entrance (existing pattern).

**Patterns to follow:**
- Existing `slideOriginX(position, reduce)` helper in current `day.ts`.
- `gsap.context()` per-frame for atomic teardown.

**Test scenarios:**
- Locked stage: scrolling from COAST advances through MORN → SURF → WALK → LIGHT, one transition per input.
- Each frame's photo enters from its position-correct corner.
- Free stage (mobile): all 4 frames stack vertically, scroll-snap aligns each at top.
- Reverse: scrolling up from LIGHT replays MORNING's enterTimeline backwards (or rather, the controller plays previous's enter and current's exit reversed).

**Verification:**
- Locked stage: only one DAY sub-frame visible at a time.
- Visual: photo arrival direction matches corner (top-right photo enters from right edge, top-left from left, etc.).
- No "jump" between sub-frames — smooth 1.7s transition with overlap.

---

- [ ] **Unit 6: WINDOW — enter/exit factories**

**Goal:** Replace pin/scrub with simple enter/exit timelines.

**Requirements:** R2, R5, R8, R9

**Dependencies:** Unit 1, Unit 2, Unit 3

**Files:**
- Modify: `src/lib/motion/window.ts`
- Modify: `src/styles/window.css` (locked stage absolute positioning)

**Approach:**
- Drop ScrollTrigger pin/scrub (already mostly done in plan 002; now also drop `scrubReveal` call).
- Export `enterTimeline(el)`: hero image scale 1.04 → 1, copy mono/display/ko fade up sequenced, two floating frames stagger-drift in.
- Export `exitTimeline(el)`: opposite — floats lift off, copy fades, image scale settles back to 1.04, slight slide-left.
- Locked-stage CSS: section is `position: absolute; inset: 0`.

**Patterns to follow:**
- Existing copy reveal sequence (mono → display → ko at 0/0.08/0.32 offsets).
- Existing float drift values (y: 32 → 0, opacity 0 → 1).

**Test scenarios:**
- Forward: copy sequence + image settle + floats arrive in 1.7s.
- Reverse: clean exit-back animation when user scrolls up from SPACE-S1.
- Reduced-motion: opacity-only crossfade.

**Verification:**
- No pin spacer in DOM (search for `.gsap-pin-spacer`).
- 1.7s transition matches the page rhythm.

---

- [ ] **Unit 7: SPACE — split into s1 / s2 chain entries; preserve hover gallery in s2**

**Goal:** Replace the SPACE pin with two chain entries sharing the same DOM. Each has its own enter/exit timelines. Hover-driven category gallery preserved (R13).

**Requirements:** R5, R8, R9, R13

**Dependencies:** Unit 1, Unit 2, Unit 3

**Files:**
- Modify: `src/lib/motion/space.ts`
- Modify: `src/styles/space.css`

**Approach:**
- Module exports two factory pairs:
  - `enterTimeline_s1(el) / exitTimeline_s1(el)` — image on right, evocative copy on left (mono / display / ko).
  - `enterTimeline_s2(el) / exitTimeline_s2(el)` — image translates left to ~-22vw, scales 1.04, sub-categories appear on right.
- s1 → s2 transition: `exitTimeline_s1` plays alongside `enterTimeline_s2`; visually, the image appears to translate left while category list materializes on the right.
- s2 → s1 transition: reverse — image translates back to right, categories fade out.
- Hover gallery: bind in module init, only takes effect when `data-state="s2"` is set on the SPACE element. Section-nav controller toggles this attribute via the timeline's onStart hook.
- Locked-stage CSS: section absolute-positioned. The s1/s2 visual states are styled via the `data-state` attribute — purely CSS.
- Drop the `scrub-reveal` import.
- Drop the pin (the entire `gsap.timeline({ scrollTrigger: { pin: true ... } })` block).

**Patterns to follow:**
- Existing s1/s2 layout in current space.ts.
- Existing hover gallery in `Space.astro` (preserve markup).

**Test scenarios:**
- Forward through SPACE: COAST → … → S1 (image right, copy left) → S2 (image left, cats right) → ADDRESS.
- s2 hover: hovering a category swaps the gallery image (existing UX).
- Reverse: S2 → S1 collapses the categories and returns the image to the right.
- Locked-stage CSS: only one of (s1 layout, s2 layout) is visible at a time.

**Verification:**
- No pin spacer in DOM for SPACE.
- s1 → s2 transition is 1.7s, matches page rhythm.
- Hover gallery works in s2 idle and is gated off in s1.

---

- [ ] **Unit 8: ADDRESS — final section enter/exit**

**Goal:** Last section in chain. Enter from right + magnetic settle. Reverse-back works cleanly.

**Requirements:** R5, R8, R9

**Dependencies:** Unit 1, Unit 2, Unit 3

**Files:**
- Modify: `src/lib/motion/address.ts` (or wherever ADDRESS motion lives — verify in Unit 1)
- Modify: `src/styles/address.css`

**Approach:**
- Read existing ADDRESS module (motion may currently be minimal).
- Export `enterTimeline(el)` / `exitTimeline(el)` matching the page grammar.
- Ensure no native scroll-down past ADDRESS (chain end → no-op).

**Patterns to follow:**
- Other section enter/exit factories in this plan.

**Test scenarios:**
- Forward: SPACE-S2 → ADDRESS, smooth 1.7s.
- Wheel-down at ADDRESS: no-op.
- Wheel-up from ADDRESS: returns to SPACE-S2.

**Verification:**
- Visual rhythm matches.
- Browser-level scroll exhausted at ADDRESS — no rubber-band.

---

- [ ] **Unit 9: Engine cleanup — remove Lenis, scrub-reveal, snap.ts, ScrollTrigger pin/scrub configs**

**Goal:** Strip the now-unused infrastructure. `engine.ts` becomes a thin orchestrator: lifecycle gates → section-nav controller boot/teardown.

**Requirements:** R10 (consistency); enables D6, D7

**Dependencies:** Units 1–8 complete (no module still imports the to-be-deleted helpers)

**Files:**
- Modify: `src/lib/motion/engine.ts` — remove Lenis init, ticker, `lenis.on('scroll', ...)`, `SNAP_TARGETS`, `createSnap`, `enableNativeSnapFallback`.
- Modify: `src/lib/motion/engine.ts` — replace startEngine/stopEngine with `bootController/teardownController`.
- Delete: `src/lib/motion/scrub-reveal.ts`
- Delete: `src/lib/motion/snap.ts`
- Modify: `package.json` — remove `lenis` dependency.
- Modify: `src/lib/motion/types.ts` if Lenis types leaked there.
- Touch: `src/lib/motion/registry.ts` — verify it still works without Lenis context.
- Verify: `gsap/ScrollTrigger` import no longer used anywhere; remove from imports.

**Approach:**
- `bootController`: builds chain, instantiates section-nav, sets `data-stage` attribute.
- `teardownController`: tears down section-nav, removes attribute.
- Lifecycle:
  - `boot()` → if not reduced-motion + not mobile → bootController(); else set `data-stage="free"` only.
  - `onReducedMotionChange` → swap modes.
  - `onBreakpointChange` → swap modes.
  - bfcache stop/start → controller stop/start.

**Patterns to follow:**
- Existing engine.ts public API shape (`boot`, `start`, `stop`, `teardown`, `isRunning`).
- Existing lifecycle cleanup pattern.

**Test scenarios:**
- `npm install` with Lenis removed completes.
- `astro check` 0 errors.
- `grep -r 'Lenis\|scroll-trigger\|scrub-reveal\|snap.ts\|SNAP_TARGETS' src/` returns no production hits (only docs/comments may remain explaining what was removed).
- bfcache: page back from another origin → controller resumes at correct section.
- Reduced-motion toggle in OS settings → page swaps to native scroll without reload.
- Resize across breakpoint → mode swaps without reload.

**Verification:**
- Bundle size shrinks ~33KB gzipped.
- DevTools: no Lenis instance in `window` / no ScrollTrigger in registered plugins.
- Page works under native scroll on mobile, controller on desktop.

---

## System-Wide Impact

- **Interaction graph:** Every section's motion module changes shape (`init(el, mode)` → `{ enterTimeline, exitTimeline }` factories). The registry-based wiring in `motion-bridge.ts` (or wherever lazy-import happens) must be reviewed — likely it now eagerly imports all modules at boot since the controller needs them all available before first input.
- **Error propagation:** Controller errors (e.g., timeline build failure, missing element) must not leave the page in a stuck `transitioning` state. Wrap each transition in try/catch; on error, force `status='idle'` and log. Any uncaught GSAP error in a per-section timeline is bounded — controller still recovers.
- **State lifecycle risks:** bfcache restore: if state is reset, user lands at section 0 unexpectedly; if state is preserved, section 0's DOM may be stale. Decision: preserve `currentIndex` across bfcache; on `pageshow`, force-replay `enterTimeline(currentIndex).progress(1)` to materialize the correct visual state without animation.
- **API surface parity:** The public motion API is the same module ID + `init` shape — but the registry now routes init differently (factory production vs. side-effect init). The Nav.astro dot UI must subscribe to controller state instead of polling scroll position.
- **Integration coverage:** Manual test — every input method (wheel, trackpad, touch, ↓/↑/PgDn/PgUp/Home/End/Space) triggers the same advance. ESC during transition fast-forwards. Resize across breakpoint mid-transition (edge case). bfcache. Browser back/forward buttons (reset to `coast`).

## Risks & Dependencies

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Trackpad inertia bypasses cooldown | Medium | Medium | Test on Mac trackpad; tune cooldown to 200ms if 150ms isn't enough |
| Mobile native scroll-snap doesn't trigger per-section enter timelines | Low | Low | On mobile, motion modules degrade to `IntersectionObserver(rootMargin: '-20% 0%')` once-fire reveals — already the pattern from `scrub-reveal`'s mobile branch |
| User has both `prefers-reduced-motion` AND is on desktop | Low | Low | Controller still active but timelines = opacity-only crossfade @ 0.4s. WCAG 2.3.3 met |
| Removing Lenis breaks existing scroll-position-dependent code | Low | Low | Inventoried — only `engine.ts` uses Lenis. No other consumers |
| HMR breaks controller state during dev | Medium | Low | `import.meta.hot.dispose` in section-nav.ts → tear down controller and rebuild on next module load. Existing pattern |
| `<html overflow: hidden>` causes layout shift on Windows scrollbar disappearance | Low | Low | `scrollbar-gutter: stable` on `<html>` — CSS one-liner |
| Skip-to-end (`goTo(8)` from 0) feels jarring | Low | Low | 1.7s with strong easing already absorbs distance. Visual: outgoing slides left + incoming slides in. Acceptable. If rejected, sequential transitions can replace |
| LANDMARK content arrives later and chain logic doesn't auto-include | Low | Medium | Chain is built from DOM order at boot; LANDMARK gains content → next reload includes it. No code change needed |
| Browser back/forward buttons don't restore section | Medium | Low | v1: page reloads to section 0. v2 (deferred): hash-based sync (`#section-id`) + popstate listener |
| User scrolls down rapidly, but transition runs in slow 1.7s, feels laggy | Medium | Low | The 1.7s is the rhythm. If complaint surfaces, drop to 1.3s |

**External dependencies:** None new. `gsap` 3.12 still required (timeline composition + easing). `lenis` removed. `gsap/ScrollTrigger` removed.

## Documentation / Operational Notes

- Update `AGENTS.md` (or `CLAUDE.md`) note about motion architecture — reference this plan as the canonical source.
- Update top-level doc-comments in `engine.ts`, every section motion module, `section-nav.ts`, `section-chain.ts` to reflect the new architecture.
- No production deploy considerations beyond the bundle-size shrink (positive).
- No analytics / event-tracking changes (this is pure interaction architecture).
- No backend / API impact.
- No SEO impact — content is still in DOM, just visually layered.
- Deprecation note in `2026-04-28-002-refactor-scroll-driven-entrance-grammar-plan.md` (status: superseded).

## Sources & References

- **Origin documents:**
  - `docs/brainstorms/2026-04-27-songjeong-landmark-brief.md`
  - `docs/plans/2026-04-27-001-feat-songjeong-landmark-site-plan.md`
- **Superseded plans:**
  - `docs/plans/2026-04-28-002-refactor-scroll-driven-entrance-grammar-plan.md` (5th rejected grammar)
- **User testimony driving this plan:**
  - 2026-04-28 messages clarifying the discrete-input mental model
  - Final summary: *"각 섹션에서 스크롤을 한다. 전환이 된다. 전환 중에는 스크롤이 먹지 않는다. 전환 이후 다시 스크롤이 가능하게 된다."*
  - Duration target: *"한 1.8초 정도"* (~1.8s)
  - Hero behavior: *"히로 섹션은 모든 컨텐츠가 로딩 된 상태에서 시작"*
  - Magnetic settle: *"마그네틱으로 고정되고"*
- **Pattern reference (general — not a copied implementation):**
  - fullPage.js — established section-snap nav pattern with a similar state machine
  - Apple iPhone product pages — fixed-stage editorial sequence
- **Institutional learnings:** S187 (silent snap failures → surface them), S188 (pin × snap drift → solved here by removing both)
- **Codebase paths anchoring the plan:** all motion modules in `src/lib/motion/`, all sections in `src/components/sections/`, all section CSS in `src/styles/`
