---
title: Songjeong Landmark (WYNDHAM) Editorial Website
type: feat
status: completed
date: 2026-04-27
deepened: 2026-04-27
completed: 2026-04-27
origin: docs/brainstorms/2026-04-27-songjeong-landmark-brief.md
---

# Songjeong Landmark (WYNDHAM) Editorial Website

## Overview

Build a single-page, six-section editorial website for a coastal landmark hotel in Busan Songjeong (WYNDHAM). The site is engineered as a **scroll-driven editorial experience**, not a booking funnel. Sections share one design system but each has a distinct scroll grammar (static reveal, vertical rise + horizontal decomposition, pinned horizontal time film, near-still floating overlays, three-state image/text crossing, poster stop).

Delivered in two phases inside one plan:

- **Phase 1**: Foundation (Astro + Tailwind v4 + GSAP/Lenis), design tokens, asset manifest, navigation shell, scroll engine, **Section 1 (PROLOGUE)** built to brief standard. Validates the tonal system before scaling.
- **Phase 2**: Sections 2–6 built on the validated system, mobile adaptations, performance/accessibility polish.

Photography and video are placeholder-driven. A living asset manifest (`docs/assets-needed.md`) is the single source for slot specs so finals can be swapped in without code changes.

## Problem Frame

The hotel's existing reference materials (CG videos, brochures, "분양홍보관 시안") frame it as a sales-driven property page. The brief explicitly rejects that framing and asks for a portfolio-grade editorial site that creates *desire and memorability* rather than booking pressure. The challenge is engineering the technical scroll system precisely enough to support that editorial intent — magnetic snap with **non-uniform** behavior per section, horizontal transitions used as semantic events not visual gimmicks, and quiet luxury sustained on mobile.

This is a brand-new, fully isolated project at `~/Downloads/hotel_b/`. No coupling to any other repository or design proposal.

## Requirements Trace

Traced from `docs/brainstorms/2026-04-27-songjeong-landmark-brief.md`.

- **R1**. First screen feels memorable before it explains anything (Coast as discovery, not advertisement).
- **R2**. Each of the six sections has a distinct scroll behavior — site does not feel like a slideshow.
- **R3**. No dedicated CTA section. CONTACT lives only as a small nav text link and an optional final epilogue link.
- **R4**. Restrained editorial palette: ivory/cream, deep black, warm hairline gray, **brass accent confined to hairlines/labels/numerals/active states only** (no filled accent areas).
- **R5**. Typography carries the design — large uppercase English display, short Korean supporting copy, mono labels for indexes.
- **R6**. 0px radius default, 1px hairline rules, sharp edges, asymmetric grids, large negative space. No rounded cards, no shadows, no glassmorphism, no decorative glow.
- **R7**. Magnetic scroll snapping with **per-section motion grammar** (see High-Level Technical Design).
- **R8**. Reveal motion: 720–1100ms, ease `cubic-bezier(0.22, 1, 0.36, 1)`, opacity + transform only, vertical drift 16–32px.
- **R9**. `prefers-reduced-motion` fully respected — disables Lenis interpolation and all scroll-pinned timelines.
- **R10**. Bilingual hierarchy (English display + Korean support), short and declarative copy, no marketing clichés.
- **R11**. Mobile must remain premium — horizontal drift converts to stacked editorial reveals on ≤768px.
- **R12**. Photography assumes refined, warm-desaturated, cinematic grading — current materials are reference-only and may be replaced. Asset pipeline must allow drop-in replacement.
- **R13**. Hotel display name: **WYNDHAM**, with `BUSAN / COASTAL LANDMARK` as supporting metadata copy.
- **R14**. Lighthouse Performance ≥ 90 and Accessibility ≥ 95 on the deployed page (mobile Slow 4G + 4× CPU profile). Full Performance Budget table in Risks section.
- **R15** (NEW, surfaced during deepening). Autoplay hero video must expose a keyboard-reachable PAUSE/PLAY control with `aria-label` and `aria-pressed` to satisfy WCAG 2.2.2 (Pause, Stop, Hide — Level A). `prefers-reduced-motion` alone is insufficient.

## Scope Boundaries

**In scope**
- Single-page editorial site with six sections.
- Design system (tokens, type ramp, scroll engine, motion utilities).
- Six-section motion grammar implementation (desktop + mobile fallback).
- Asset manifest workflow.
- Reduced-motion and basic accessibility (keyboard, alt text, contrast).
- Static deploy build (Astro `astro build`).

**Out of scope (explicit non-goals)**
- Booking engine, room availability, payment, or reservation flows.
- CMS integration (Sanity/headless) — defer until content velocity justifies it.
- Authentication, user accounts, member areas.
- Multi-locale routing (`/ko`, `/en`). Bilingual copy is mixed inline as the brief examples show.
- Backend API, database, server runtime.
- Email/contact form backend (mailto link is sufficient unless decided otherwise later).
- Analytics, marketing pixels, A/B testing infra.
- WebGL / 3D / Three.js / shader effects (brief explicitly excludes).
- Custom cursor, mouse trails, glow hover, scale-down press.
- Any coupling to or asset import from `~/Desktop/hotel_win/` or any other project.

## Context & Research

### Workspace state
- Working directory: `~/Downloads/hotel_b/` — empty greenfield, no prior code.
- Brief moved to `docs/brainstorms/2026-04-27-songjeong-landmark-brief.md` (origin doc).
- Reference materials available at `~/Desktop/hotel_info/` (3-min promo videos, teaser MV, ALL CG, 20-second broadcast ad, brochure ZIP) — **referenced for understanding only, not imported**. User will populate finals into the asset manifest later.

### Relevant codebase patterns
- None — fresh project. Patterns will be established by this plan.

### Institutional learnings
- None applicable in `docs/solutions/`.

### External references (well-established patterns)
- **GSAP ScrollTrigger** for pinned sections + scroll-progress-driven horizontal translates is the canonical approach for award-winning editorial sites (Lusion, Active Theory, Locomotive). Documentation at `gsap.com/docs/v3/Plugins/ScrollTrigger/`.
- **Lenis (Studio Freight)** for scroll interpolation; pairs with ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)` and a single shared rAF loop. Documentation at `lenis.darkroom.engineering/`.
- **Astro v4+** ships zero JS by default; motion code goes in client islands via `<script>` or framework integration. Image optimization built in. Documentation at `docs.astro.build/`.
- **Tailwind v4** uses CSS-first config (`@theme` directive in `global.css`); no `tailwind.config.js` required.

## Key Technical Decisions

- **Stack: Astro ^5.2 + Tailwind v4 (`@tailwindcss/vite`) + GSAP 3 + ScrollTrigger + Lenis 1.x + TypeScript.** *Updated*: Astro must be **^5.2** (not 4.x) because Tailwind v4 stable (released 2025-01-22) requires the `@tailwindcss/vite` plugin, which Astro 5.2+ supports natively via `npx astro add tailwind`. The legacy `@astrojs/tailwind` integration is deprecated for v4. Rationale: Astro static output baseline + GSAP for pin/track choreography + Lenis for editorial-grade smooth scroll. Source: Astro 5.2 release notes, Tailwind Astro install guide.
- **GSAP + ScrollTrigger is free under the GSAP standard "no charge" license** (Webflow/GreenSock 2024+, unchanged in 2026). All previously paid Club plugins (SplitText, ScrollSmoother, MorphSVG, DrawSVG) are also free. Dependency channel: npm `gsap@3.x` direct, NOT CDN. License URL: https://gsap.com/standard-license. Rationale: removes any contingency budget; opens optional adoption of SplitText for text reveals without licensing concern.
- **Snap architecture (REVISED, was the largest gap)**: native CSS `scroll-snap-type` is **incompatible with Lenis** — Lenis README explicitly states *"no support for CSS scroll-snap, you must use lenis/snap"*. Decision: use the **`lenis/snap`** plugin for magnetic snap behavior with `type: 'proximity'` (NOT `'mandatory'`, due to iOS Safari "infinite scroll-to-end" bug WebKit #245722). Native CSS `scroll-snap-type: y proximity` is enabled **only** as a reduced-motion fallback when Lenis is destroyed. Pinned sections (Day, Space) explicitly opt out of snap via `scroll-snap-stop: normal` and have `scroll-snap-align: none` so they cannot fight ScrollTrigger pin math. Rationale: a single canonical snap source per execution mode; no fight between native and JS interpolation. Sources: Lenis README, WebKit bug 245722.
- **One scroll engine, canonical Lenis × GSAP recipe.** Lenis runs with `autoRaf: false`. GSAP's ticker drives Lenis (`gsap.ticker.add(t => lenis.raf(t * 1000))`). Lenis emits `scroll` → calls `ScrollTrigger.update`. `gsap.ticker.lagSmoothing(0)` is required. **No `scrollerProxy`** — Lenis on document level uses native `window.scrollY`. Rationale: single shared rAF prevents jitter and pin desync. Sources: Lenis README, GSAP forum patterns.
- **Per-section motion module with `gsap.context()` boundary.** Each module's `init(el, mode)` returns a `gsap.Context` (`gsap.context(() => { /* tweens, ScrollTriggers */ }, el)`). `destroy()` calls `ctx.revert()`, which kills every tween/timeline/ScrollTrigger created inside the context atomically. The registry guarantees teardown on (a) `prefers-reduced-motion` change, (b) breakpoint crossing, (c) `astro:before-swap` (if View Transitions added later — out of scope v1 but lock the contract now), (d) Vite HMR `import.meta.hot.dispose`. Rationale: prevents leaked ScrollTriggers across mode swaps and dev hot reloads.
- **`ScrollTrigger.config({ ignoreMobileResize: true })`** is mandatory. iOS URL-bar collapse fires resize on every scroll direction change; without this flag, the engine fires `ScrollTrigger.refresh()` constantly, recomputing all five pinned sections (≈40–120ms per refresh on Moto G Power class device). Source: GSAP docs.
- **Lazy import per-section motion modules.** Only the engine, registry, reduced-motion gate, breakpoint listener, and PROLOGUE module ship in the initial bundle. Sections 2–6 are dynamically imported when their wrapper enters viewport (`IntersectionObserver` with rootMargin 50%). GSAP imports are modular (`import { gsap } from 'gsap'`, `import { ScrollTrigger } from 'gsap/ScrollTrigger'`). Rationale: keeps initial JS gzipped budget ≤ 90 KB (see Performance Budget).
- **Active-section nav state driven by Lenis scroll progress, not IntersectionObserver alone.** Long pinned sections (Day ~400vh, Space ~300vh) do not change IntersectionObserver state mid-pin, so the nav would appear stuck. Decision: declare each section's start/end scroll range once after `triggerRefresh()`; on each Lenis scroll event, compute active id from the range. IntersectionObserver remains as a coarse fallback for keyboard `tab` and reduced-motion mode. Rationale: single source of truth survives pins.
- **Hero LCP target = poster image, not video.** Chrome's LCP heuristic measures the autoplay video's first frame as LCP. Decision: render a plain `<img fetchpriority="high">` for the poster from first paint; mount the `<video>` element only after `window.load` (or Lenis first-scroll event), with `preload="metadata"`, `<source>` ladder AV1 → H.264. (HEVC is dropped — Safari-only, gains nothing in Chrome/Firefox, complexity not worth it.) Rationale: makes LCP reliably the poster image (≤ 2.0 s mobile Slow 4G); the video becomes a perceptual-quality enhancement, not a Core Web Vitals risk. Sources: web.dev video performance, Aaron Grogg LCP-for-video-hero (Jan 2026), DebugBear.
- **Asset manifest is typed for Astro `<Image>` integration.** `AssetSpec` distinguishes `image` (uses `import` of `ImageMetadata` from `src/assets/`, paired with `widths` + `sizes` for responsive AVIF generation) from `video` (uses `public/`-relative `<source>` ladder + `ImageMetadata` poster). Components consume via `getImage(slotId)` or `getVideo(slotId)` — typed split, not generic `getAsset`. Rationale: lets Astro's build pipeline emit fingerprinted AVIF variants automatically (~60% byte reduction vs raw JPG).
- **No Tailwind defaults.** All Tailwind base colors, shadows, radii are excluded from `@theme`. Only project tokens are exposed. Rationale: prevents drift into SaaS aesthetics (R4, R6).
- **Brass accent strict-scope.** `--color-brass` is allowed only on `hr`, `.label-mono`, numerals, active link state — guarded via lint-style allow-list in CSS comments and PR reviewer checklist. Rationale: R4 prohibits filled accent areas.
- **Asset manifest as source of truth.** All media references in code use SLOT-IDs (`PROLOGUE-01`, `LANDMARK-02`, …) resolved through `src/data/asset-manifest.ts`. Stills live under `src/assets/placeholders/` (so Astro processes them); video files live under `public/` (Astro doesn't transform video). Rationale: lets the user drop final files in by mapping SLOT-IDs without touching component code (R12).
- **No Tailwind for typography ramp.** Display, body, mono ramps live in `src/styles/typography.css` using fluid `clamp()` so the giant display copy works across viewports without breakpoint stair-steps.
- **Static build, no SSR.** `astro build` outputs static HTML → deployable to Vercel/Netlify/CF Pages/static host without runtime constraints.
- **View Transitions are out of scope for v1.** If added later, `engine.ts` must expose `dispose()` bound to `astro:before-swap` and re-init on `astro:page-load`. Lock this assumption now so the registry contract is not retrofitted later.

## Open Questions

### Resolved during planning
- **Codebase strategy**: Independent project at `~/Downloads/hotel_b/`. No coupling to other proposals.
- **Stack**: Astro **^5.2** + Tailwind v4 (`@tailwindcss/vite`) + GSAP 3 + ScrollTrigger + Lenis 1.x + TypeScript.
- **Asset strategy**: Placeholders + manifest; user populates finals later. Manifest split by media kind (image vs video) to integrate with Astro `<Image>`.
- **Phasing**: Two phases in one plan, with a **Phase 1.5 stub Day frame** to validate that tokens generalize beyond PROLOGUE before Phase 2 commits.
- **Accent color**: Brass, hairline/label/numeral/active-state scope only.
- **Hotel display name**: WYNDHAM (with `BUSAN / COASTAL LANDMARK` supporting copy).
- **Scroll grammar map**: Codified in High-Level Technical Design.
- **Snap architecture**: `lenis/snap` plugin with `type: 'proximity'` is the magnetic snap source. Native CSS `scroll-snap-type: y proximity` is reduced-motion fallback only. Pinned sections opt out of snap.
- **GSAP licensing**: Free under standard "no charge" license post-Webflow acquisition (2024+, unchanged 2026). All plugins free including SplitText.
- **Latin display + Korean pairing**: Inter Tight (Latin, variable) + Pretendard subset KR. Inter is Pretendard's metric-source family, so x-heights align by construction.
- **Hero LCP element**: poster image rendered as `<img fetchpriority="high">` from first paint; video element mounts after `window.load`.
- **Mobile horizontal fallback**: Stacked editorial reveals; specific mapping per section.

### Deferred to implementation
- **Exact editorial display face for headlines.** Inter Tight is the metric-safe default, but a higher-contrast editorial face (Editorial New, Migra, GT Sectra, PP Editorial Old) may be paired alongside for headline-only display. Decide during Unit 2 with a side-by-side test.
- **Exact monospace face.** JetBrains Mono vs. IBM Plex Mono — decide during Unit 2 based on numeric label legibility at small sizes.
- **Exact easing curves per section variant.** Base is `cubic-bezier(0.22, 1, 0.36, 1)`. Some sections may want slower (1100ms) or quicker (720ms) variants — decide during PROLOGUE polish.
- **Final Korean copy.** Brief examples are placeholder-quality. Real copy passes after PROLOGUE visual lands so tone is calibrated to actual rendering.
- **Number of WINDOW floating frames.** Brief says 1–2; decide visually during Unit 10.
- **Specific SPACE sub-categories rendered.** Depends on which assets the user supplies (rooms / pool / dining / fitness / lounge subset).
- **Contact mechanism.** Default to `mailto:` link until user requests a form. If form is needed, decide between Formspree/Netlify Forms/serverless function at that point.
- **Lenis tuning constants** (`duration`, `easing`, `smoothTouch`, idle-pause threshold). Tune during Unit 4 against real device feel.
- **`lenis/snap` lerp tuning.** Decide during Unit 4 against device feel.
- **Whether SPACE 3-state timeline opts into `snap.snapTo: 'labels'`** (magnetic state landing) or scrubs continuously (film-like). Decide during Unit 11 visual review.
- **Optional adoption of GSAP SplitText** (now free) for PROLOGUE/ADDRESS text reveals — would save ~40 LOC per section and provide screen-reader-safe reveals via `aria` reconstruction. Decide during Unit 6 / Unit 12.
- **Deploy target.** Vercel vs. Netlify vs. CF Pages — defer until first preview is needed.

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

### Scroll Grammar Map (the spine of this site)

| # | Section | Desktop motion | Mobile (≤768px) fallback | Why |
|---|---------|---------------|--------------------------|-----|
| 1 | **Coast** | Vertical snap + slow horizon shift, copy fades in asymmetrically | Same | Discovery, not advertisement. Static is the statement. |
| 2 | **Landmark** | Vertical rise pinning the building → **single horizontal decomposition event** revealing facade detail beside the silhouette | Vertical rise → two stacked reveals (silhouette, then detail) | Looking up, then scanning across — two architectural gestures. |
| 3 | **Songjeong Day** | Section pinned ~400vh; image track translates **horizontally** through Morning → Surf → Walk → Light; time labels left-anchored; thin progress hairline at bottom | Section pinned; four scenes fade-through vertically; time labels persist | Time flow as horizontal film. The site's main "wow" moment — earned by being the only main horizontal stretch. |
| 4 | **Window** | Main interior view holds nearly still; 1–2 floating editorial frames drift 16–32px and shift opacity | Main image static; floating frames stack and reveal sequentially | Re-edited layout, not slideshow. Quiet. |
| 5 | **Space** | Three-state pinned timeline: **sense** (image right) → **structure** (image crosses left and dominates) → **information** (image recedes; thin lines/numbers/plan appear) | Three states stacked vertically; same content order | Editorial transformation from feeling to information — defeats card-grid look. |
| 6 | **Address** | Full stop. No scroll motion inside the section. Display type fades in, then nothing. | Same | Final imprint. Stillness is the point. |

### Composition Diagram

```
PAGE (Lenis-driven smooth scroll, scroll-snap-type: y mandatory)
│
├── <Nav>  (sticky, hairline-bottom; logo left, section index right, CONTACT link)
│
├── <Section id="coast">           — vertical snap, copy reveal
├── <Section id="landmark">        — pinned: vertical rise → horizontal split
├── <Section id="day">             — pinned: horizontal time-film track (~400vh scroll)
├── <Section id="window">          — pinned: still main + floating frames drift
├── <Section id="space">           — pinned: 3-state crossing timeline
└── <Section id="address">         — static poster
```

### Motion module shape (directional)

```
src/lib/motion/
├── engine.ts          (Lenis init + shared rAF + ScrollTrigger.update wiring)
├── registry.ts        (register/teardown per-section, reduced-motion gate)
├── prologue.ts        (R1 — coast)
├── landmark.ts        (R7 — vertical rise + 1 horizontal event)
├── day.ts             (R7 — pinned horizontal film)
├── window.ts          (R7 — floating overlay drift)
├── space.ts           (R7 — 3-state crossing)
└── address.ts         (R7 — entrance fade only)
```

Each module exports `init(el)` and `destroy()`. The registry calls `destroy()` and re-`init()` on `(prefers-reduced-motion: reduce)` change and on viewport breakpoint crossings that swap desktop/mobile choreography.

### Token shape (directional)

```
@theme {
  /* color — exhaustive; no other colors exposed */
  --color-ivory: ...;        --color-bone: ...;            --color-ink: ...;
  --color-hair: ...;         --color-brass: ...;

  /* type */
  --font-display: ...;       --font-body: ...;             --font-mono: ...;

  /* motion */
  --ease-editorial: cubic-bezier(0.22, 1, 0.36, 1);
  --duration-reveal-base: 820ms;
  --duration-section: 700ms;
  --duration-state-cross: 480ms;     /* Space state-to-state transition */
  --duration-time-label: 280ms;      /* Day time-label cross-fade */

  /* structure */
  --hairline: 1px;           --radius-fn: 2px;             /* base radius is 0 */
  --track-gutter: clamp(48px, 6vw, 96px);                  /* Day inter-frame gutter */
  --progress-hairline-h: 1px;                              /* Day bottom progress bar */
  --pin-day: 400svh;        --pin-space: 300svh;
  --pin-window: 150svh;     --pin-landmark: 200svh;
}
```

### Lifecycle / Registry behavior (directional)

```
boot
 └─ engine.init()
     ├─ check prefers-reduced-motion         → if reduce: skip Lenis, skip ScrollTrigger registration
     ├─ check navigator.connection.saveData  → if true: treat as reduce
     ├─ Lenis({ autoRaf: false })
     ├─ gsap.ticker.add(t => lenis.raf(t * 1000))
     ├─ gsap.ticker.lagSmoothing(0)
     ├─ lenis.on('scroll', ScrollTrigger.update)
     ├─ ScrollTrigger.config({ ignoreMobileResize: true })
     └─ register sections (PROLOGUE eager, others lazy via IntersectionObserver)

per-section motion module
 ├─ init(el, mode):  ctx = gsap.context(() => { /* tweens, ScrollTriggers */ }, el)
 └─ destroy():       ctx.revert()                ← kills every trigger atomically

triggerRefresh sequence (canonical)
 1. construct triggers
 2. await document.fonts.ready          → ScrollTrigger.refresh()
 3. window 'load'                       → ScrollTrigger.refresh()
 4. each <video> 'loadedmetadata'       → debounced refresh
 5. lazy <img> with explicit w/h        → no refresh needed (preferred)
    lazy <img> without dims             → 'load' → debounced refresh
 6. orientationchange + debounced resize→ ScrollTrigger handles (because of #2-#3)

mode change broadcast (registry.restartAll on:)
 ├─ matchMedia('(prefers-reduced-motion: reduce)') change
 ├─ matchMedia('(min-width: 769px)') change       (breakpoint)
 ├─ astro:before-swap (reserved; v1 has no SPA nav)
 └─ Vite import.meta.hot.dispose         (dev only)

bfcache lifecycle
 ├─ pagehide                  → engine.stop(), persist scroll
 └─ pageshow event.persisted  → ScrollTrigger.refresh(), engine.start()
```

## Implementation Units

### Phase 1 — Foundation + PROLOGUE (validates tonal system)

- [x] **Unit 1: Project bootstrap (Astro ^5.2 + Tailwind v4 + TS + dependencies)**

**Goal:** Working Astro ^5.2 project that builds and serves; Tailwind v4 wired via `@tailwindcss/vite`; TypeScript strict; GSAP 3 + ScrollTrigger + Lenis 1.x installed via modular imports.

**Requirements:** Foundation for R1–R14.

**Dependencies:** None.

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `.npmrc`, `pnpm-lock.yaml` (committed), `src/pages/index.astro`, `src/layouts/Base.astro`, `src/styles/global.css`, `README.md`
- Modify: —
- Test: smoke check in `package.json` scripts (`astro check && astro build`)

**Approach:**
- Bootstrap with `npm create astro@latest` selecting the **minimal template** + **TypeScript strict**, then run `npx astro add tailwind` (Astro 5.2+ scaffolds the `@tailwindcss/vite` plugin and `src/styles/global.css` automatically). Confirm `package.json` shows `"astro": "^5.2.x"` and `@tailwindcss/vite` (NOT `@astrojs/tailwind`).
- Direct deps: `gsap@^3` (modular imports — `import { gsap } from 'gsap'`, `import { ScrollTrigger } from 'gsap/ScrollTrigger'`), `lenis@^1`. NEVER use the all-in-one `gsap/dist/gsap.js` bundle (defeats tree-shaking).
- Dev deps: `typescript`, `prettier`, `prettier-plugin-astro`.
- `tsconfig.json` extends `astro/tsconfigs/strict`.
- `package.json` scripts: `dev`, `build`, `preview`, `typecheck` (`astro check`), `lint` (prettier check).
- `pnpm` is the package manager (lockfile committed). Reproducible installs across machines.
- README: one-paragraph project intent + `pnpm dev` instructions; no marketing copy.

**Patterns to follow:** Astro starter conventions (`src/pages`, `src/layouts`, `public/`).

**Test scenarios:**
- `pnpm install` succeeds with no peer warnings.
- `pnpm dev` serves a blank page at `localhost:4321` with no console errors.
- `pnpm build` outputs static HTML to `dist/`.
- `pnpm typecheck` passes.
- A throwaway `<script>` block in `index.astro` that does `import { gsap } from 'gsap'` and `import Lenis from 'lenis'` compiles cleanly and produces a small bundle in `dist/_astro/`.
- `dist/_astro/` shows hashed Tailwind utility CSS (proof v4 pipeline is wired).

**Verification:** Empty page renders, dev server hot-reloads on edits, `dist/index.html` is < 5KB, Tailwind utilities work (e.g., `class="text-sm"` produces output), no preflight color classes leak.

---

- [x] **Unit 2: Design tokens + typography ramp + split-loading recipe**

**Goal:** Complete design system tokens declared in `@theme`. Typography ramp renders correctly using `unicode-range` split-loading: Latin display only ships Latin glyphs; Pretendard subset KR ships Korean glyphs. Brass strictly available only as `--color-brass`.

**Requirements:** R4, R5, R6, R8, R10. Performance budget: fonts on critical path ≤ 120 KB.

**Dependencies:** Unit 1.

**Files:**
- Create: `src/styles/typography.css`, `src/styles/tokens.css` (imported into `global.css`), `src/pages/_dev/tokens.astro` (dev-only token preview, gated by `import.meta.env.DEV`), `src/assets/fonts/` (self-hosted woff2 — Inter Tight Latin subset + Pretendard KR subset)
- Modify: `src/styles/global.css` (import tokens + typography)
- Test: visual inspection in `_dev/tokens` route + Lighthouse on tokens page

**Approach:**
- `@theme` declares the full token shape from HLTD (color + type + motion + structure tokens incl. `--track-gutter`, `--progress-hairline-h`, per-section pin lengths).
- Display/body type uses fluid `clamp(min, vw-based, max)` so giant English display works from mobile to ultrawide.
- Mono labels at 11–12px with letter-spacing 0.08em uppercase.
- **Font split-loading recipe (canonical):**
  ```
  @font-face { font-family: "Display";    src: url(/fonts/inter-tight-latin.woff2) format("woff2");
               unicode-range: U+0000-024F, U+2000-206F, U+2070-209F;
               font-display: swap; }
  @font-face { font-family: "Pretendard"; src: url(/fonts/pretendard-kr-subset.woff2) format("woff2");
               unicode-range: U+AC00-D7AF, U+1100-11FF, U+3130-318F;
               font-display: swap; }
  body { font-family: "Display", "Pretendard", system-ui, sans-serif; font-size-adjust: from-font; }
  ```
  Browser fetches only the bytes a glyph actually needs.
- Pretendard is **subset KR** (~80–120 KB woff2 per weight, NOT the full 3 MB pack). Use `pretendard-dynamic-subset` or build via `pyftsubset` with the Hangul Syllables block.
- Inter Tight is the metric-safe Latin pairing for Pretendard (Pretendard derives from Inter). For headline-only display, an editorial face (Editorial New, Migra, GT Sectra, PP Editorial Old) may be tested side-by-side; if adopted, it ships ONLY for headlines, not body, to avoid bloat.
- Mono face: JetBrains Mono or IBM Plex Mono — choose by numeric label legibility at 11–12 px.
- Line-height parity for inline KR/EN mixes: `line-height: 1.1` and `font-size-adjust: from-font` on the Latin face syncs x-heights so `( 02 / VERTICAL )` style mixes don't bob.
- A CSS comment at the top of `tokens.css` documents the brass scope rule (R4) for future contributors.

**Patterns to follow:** Tailwind v4 CSS-first config conventions; web.dev font best-practices.

**Test scenarios:**
- `_dev/tokens` page shows: full type ramp (display 6 sizes, body 3, mono 2), all five color swatches, hairline rule sample, easing demo (3 squares animating with `--ease-editorial`).
- DevTools Network tab: only the Latin display weight is requested on a Latin-only test paragraph; only Pretendard subset KR is requested when Korean is rendered. Both files together ≤ 120 KB.
- Korean glyphs render with Pretendard, no tofu/fallback artifacts.
- DevTools shows all tokens as CSS custom properties on `:root`.
- Brass is only visible on the swatch; no class outputs `background: var(--color-brass)` larger than 1px.
- `prefers-reduced-motion: reduce` (DevTools emulation) freezes the easing demo.

**Verification:** Token preview matches the brief's tonal direction; reviewer can identify which token controls each visual element by inspecting the page; font payload on the critical path measured ≤ 120 KB.

---

- [x] **Unit 3: Asset manifest (typed for Astro `<Image>`) + placeholder pipeline**

**Goal:** Living `docs/assets-needed.md` table is the single source for all media slots. Code resolves all media via SLOT-IDs through `src/data/asset-manifest.ts` with **typed split**: `getImage(slotId)` returns Astro `ImageMetadata` (lets `<Image>` emit AVIF/srcset variants automatically); `getVideo(slotId)` returns the `<source>` ladder + poster. Placeholder files cover all Phase 1 slots; Phase 2 slots listed as `(pending)`.

**Requirements:** R12. Performance budget: median image ≤ 80 KB AVIF mobile-1x; total images on first viewport ≤ 250 KB.

**Dependencies:** Unit 1.

**Files:**
- Create: `docs/assets-needed.md`, `src/data/asset-manifest.ts`, `src/lib/asset.ts` (helpers: `getImage(slotId)`, `getVideo(slotId)`), `src/assets/placeholders/.gitkeep`, `src/assets/placeholders/PROLOGUE-01-poster.{avif,webp,jpg}`, `public/videos/.gitkeep`, `public/videos/PROLOGUE-01.av1.mp4` (placeholder), `public/videos/PROLOGUE-01.h264.mp4` (placeholder)
- Modify: —
- Test: `tests/asset-manifest.test.ts` — every SLOT-ID in `asset-manifest.ts` has a row in `assets-needed.md`; every image SLOT has a resolvable Astro import; every video SLOT has at least one valid `<source>` file present.

**Approach:**
- **Critical: stills live under `src/assets/`** (so Astro's image pipeline processes them via Vite/Sharp and emits hashed AVIF + responsive widths). **Videos live under `public/`** (Astro doesn't transform video; manifest references `public/`-relative paths). This split is non-optional — using `public/` for stills bypasses Astro `<Image>` and forfeits the responsive variants that drive perf budget.
- `assets-needed.md` table columns: SLOT-ID · Section · Kind (image/video) · Aspect / Duration · Tone notes · Codec ladder (video only) · Current file · Final file (status) · Notes.
- Pre-populate every SLOT (PROLOGUE-01, LANDMARK-01..03, FLOW-MORNING/SURF/WALK/LIGHT, WINDOW-01..03, SPACE-01..N, EPILOGUE-01) with `(pending)` for any not yet placeholder-filled.
- `asset-manifest.ts` exports two typed maps:
  ```
  type ImageSpec = {
    kind: 'image';
    import: ImageMetadata;          // import alias from src/assets/...
    alt: string;
    sizes: string;                  // e.g., '(max-width: 768px) 100vw, 80vw'
    widths: number[];               // e.g., [480, 960, 1440, 1920]
    tone: string;
    final?: ImageMetadata;
  };
  type VideoSpec = {
    kind: 'video';
    sources: Array<{ src: string; type: string }>;  // AV1 first, H.264 fallback
    poster: ImageMetadata;
    posterAlt: string;
    duration?: string;
    tone: string;
    final?: { sources: Array<{...}>; poster: ImageMetadata };
  };
  export const IMAGES: Record<ImageSlotId, ImageSpec>;
  export const VIDEOS: Record<VideoSlotId, VideoSpec>;
  ```
- `getImage(slotId)` returns `ImageSpec`; `getVideo(slotId)` returns `VideoSpec`. Components import these and feed `<Image>` / `<video>` directly — no string-path manipulation in components.
- **Codec ladder for video**: `<source type='video/mp4; codecs="av01.0.05M.08"'>` first → `<source type='video/mp4; codecs="avc1.640028"'>` (H.264 fallback) last. **HEVC dropped** (Safari-only, no payoff over AV1+H264 pair). Each video SLOT requires both files.
- For Phase 1, only `PROLOGUE-01` requires real placeholders (coastal video — generate AV1+H.264 from Pexels/Pixabay free stock; poster as multi-format AVIF/WebP/JPG).
- Components use Astro `<Image>` for stills: `<Image src={spec.import} alt={spec.alt} sizes={spec.sizes} widths={spec.widths} format="avif" />`. Astro emits hashed `<picture>` with srcset.

**Patterns to follow:** Astro v5 image pipeline conventions; `astro:assets` types.

**Test scenarios:**
- Importing a non-existent SLOT-ID produces a TypeScript error.
- `getImage('LANDMARK-01')` returns an `ImageSpec` whose `import` resolves to a real file in `src/assets/`.
- `getVideo('PROLOGUE-01')` returns a `VideoSpec` with at least 2 sources (AV1 + H.264) and a poster.
- `assets-needed.md` lists every SLOT-ID present in `asset-manifest.ts` (verified by test).
- Build emits `dist/_astro/PROLOGUE-01-poster.<hash>.avif` (proves Astro's image pipeline ran).
- Build succeeds with placeholders only.

**Verification:** A reviewer can read `assets-needed.md` and immediately understand what real photography (and what codec variants) to provide. Replacing a placeholder requires only updating the `final` field in `asset-manifest.ts` — components stay unchanged.

---

- [x] **Unit 4: Layout shell + scroll engine (canonical Lenis × GSAP recipe) + lifecycle gates**

**Goal:** `Editorial.astro` layout with hairline sticky nav. Engine runs the canonical Lenis × GSAP integration (GSAP ticker drives Lenis, Lenis emits scroll → ScrollTrigger.update). Registry uses `gsap.context()` for atomic teardown. All four lifecycle gates respected: prefers-reduced-motion, breakpoint, bfcache (pageshow/pagehide), Vite HMR. `lenis/snap` plugin provides magnetic snap with `proximity` mode. Active-nav state driven by Lenis scroll progress against pre-declared section ranges (survives long pins).

**Requirements:** R3 (nav with CONTACT only), R6 (hairline), R7 (scroll system foundation), R9 (reduced-motion).

**Dependencies:** Unit 1, Unit 2.

**Files:**
- Create: `src/layouts/Editorial.astro`, `src/components/Nav.astro`, `src/lib/motion/engine.ts`, `src/lib/motion/registry.ts`, `src/lib/motion/reduced-motion.ts`, `src/lib/motion/breakpoint.ts`, `src/lib/motion/bfcache.ts`, `src/lib/motion/snap.ts` (lenis/snap config), `src/lib/motion/nav-progress.ts`, `src/styles/nav.css`
- Modify: `src/pages/index.astro` (use Editorial layout)
- Test: `tests/scroll-engine.test.ts` (logic tests for registry register/destroy/restart with mocked context)

**Approach:**

*Canonical engine recipe (paste-ready directional snippet, NOT implementation prescription):*
```
// engine.ts
const lenis = new Lenis({ autoRaf: false /* GSAP drives raf */ });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
ScrollTrigger.config({ ignoreMobileResize: true });   // iOS URL-bar fix
// no scrollerProxy needed — Lenis is body-level
```

*Snap (lenis/snap):*
```
// snap.ts
import Snap from 'lenis/snap';
const snap = new Snap(lenis, { type: 'proximity', lerp: 0.1 });
snap.addElement(document.getElementById('coast'),    { align: 'start' });
snap.addElement(document.getElementById('landmark'), { align: 'start' });
// Day, Space NOT added — pinned sections opt out of snap.
snap.addElement(document.getElementById('window'),   { align: 'start' });
snap.addElement(document.getElementById('address'),  { align: 'start' });
```

*Registry contract (`MotionModule`):*
```
interface MotionModule {
  init(el: HTMLElement, mode: 'desktop' | 'mobile'): gsap.Context;
  // destroy is implicit: caller calls ctx.revert() — kills every tween/ScrollTrigger atomically.
}
```
Registry stores `Map<id, gsap.Context>`. `destroy(id)` calls `ctx.revert()`. `destroyAll()` reverts all. `restartAll(mode)` reverts then re-inits.

*Reduced-motion + Save-Data gate:*
```
const reduce =
  matchMedia('(prefers-reduced-motion: reduce)').matches ||
  navigator.connection?.saveData === true ||
  ['slow-2g', '2g'].includes(navigator.connection?.effectiveType ?? '');
```
On `reduce`: skip Lenis init entirely, skip lenis/snap, skip all motion module registrations. Native CSS `scroll-snap-type: y proximity` becomes the only snap source on `<html>`. Engine listens for change events on the matchMedia and `connection` and reboots accordingly.

*Breakpoint gate:* `matchMedia('(min-width: 769px)')` change → `registry.restartAll(newMode)`.

*bfcache:*
```
addEventListener('pagehide', () => engine.stop());
addEventListener('pageshow', (e) => {
  if (e.persisted) { ScrollTrigger.refresh(); engine.start(); }
});
```

*HMR cleanup (dev only):* every motion module file ends with
```
if (import.meta.hot) {
  import.meta.hot.dispose(() => registry.destroy(MODULE_ID));
}
```

*`triggerRefresh()` orchestration:*
1. Sections register their triggers.
2. `await document.fonts.ready` → `ScrollTrigger.refresh()`.
3. `window.addEventListener('load', ...)` → `ScrollTrigger.refresh()` (catches eager images).
4. Each `<video>` `loadedmetadata` → 150 ms-debounced `ScrollTrigger.refresh()`.
5. Lazy `<img>` MUST have explicit `width`/`height` attributes (no refresh storm).
6. `orientationchange` + 150 ms-debounced resize → ScrollTrigger handles automatically (because `ignoreMobileResize: true` already filters URL-bar churn).
7. Use `ScrollTrigger.refresh(true)` (safe form) at all post-boot calls so it doesn't interrupt active scroll.

*Lenis idle pause (battery):* engine subscribes to lenis scroll events; if `|velocity| < 0.01` for > 500 ms, call `lenis.stop()`. On `wheel` / `touchstart` / `keydown` → `lenis.start()`. Also pause on `document.visibilitychange` → hidden.

*Nav.astro:* WYNDHAM logo (text mark, display font, all caps, brass-free) on left; six section labels (COAST · LANDMARK · DAY · WINDOW · SPACE · ADDRESS) on right at small mono size; CONTACT text link (`mailto:` placeholder) at far right. Sticky with 1px hairline-bottom.

*Active-nav state via Lenis scroll progress (`nav-progress.ts`):* after `triggerRefresh()`, query each section element's `getBoundingClientRect().top + window.scrollY` to build a `Map<sectionId, [start, end]>`. Subscribe to lenis `scroll` event; compute active id from current scroll position against the map. Active label gets a brass 1px underline. **No IntersectionObserver for active state** — it fails during long pins. (IntersectionObserver may still be used as a coarse fallback under reduced-motion when Lenis is destroyed.)

**Patterns to follow:** Lenis README integration recipe; GSAP ScrollTrigger context docs; web.dev bfcache best practices.

**Test scenarios:**
- Default (no reduced-motion, fast network): Lenis interpolates scroll buttery; ScrollTrigger pins compute correctly; lenis/snap softly aligns Coast/Landmark/Window/Address but NOT Day/Space.
- `prefers-reduced-motion: reduce`: Lenis never instantiates; native CSS `scroll-snap-type: y proximity` engages on `<html>`; all motion modules are absent; no console errors.
- DevTools "Save-Data: on" emulation: identical to reduced-motion path.
- Toggling reduced-motion off → on → off: clean teardown / restart, `registry.size` returns to expected counts (no leaks).
- Resizing across the desktop/mobile breakpoint: `registry.restartAll('mobile')` fires exactly once; section modules re-init with new mode.
- iOS URL-bar collapse simulation (Chrome DevTools resize storm): no ScrollTrigger.refresh() spam (verified by counting `console.time` markers).
- Edit a section module file in dev: HMR replaces module without leaking ScrollTriggers (verified by `ScrollTrigger.getAll().length` staying stable).
- Hard navigate away and Back (bfcache restore): page resumes without pin-offset drift.
- Lenis idle pause: leave page alone for 1 s; rAF loop pauses (verified via DevTools Performance recording).
- Nav active label updates as page scrolls — including during the 400svh Day pin (label stays correct because nav-progress uses scroll position, not viewport intersection).
- Keyboard tabbing reaches nav links and CONTACT in correct order.

**Verification:** Smooth scroll feels editorial (Awwwards-grade buttery, not slippery). All four lifecycle gates demonstrably work. Reduced-motion path produces a fully usable static site. No console errors, no leaked ScrollTriggers across 10 minutes of dev work.

---

- [x] **Unit 5: Section wrapper (semantic + a11y discipline at scaffold) + snap baseline**

**Goal:** Reusable `<SectionWrapper>` component that enforces semantic HTML and ARIA at scaffold time (not deferred to polish). Renders `<section aria-labelledby="...">` with a slotted `<h2>`, asymmetric mono index label (`aria-hidden`), correct snap behavior including pinned-section opt-out. Six section stubs render in correct order.

**Requirements:** R2, R7. WCAG: section landmarks, heading hierarchy.

**Dependencies:** Unit 4.

**Files:**
- Create: `src/components/SectionWrapper.astro`, `src/styles/sections.css`, `src/components/sections/Coast.astro`, `src/components/sections/Landmark.astro`, `src/components/sections/Day.astro`, `src/components/sections/Window.astro`, `src/components/sections/Space.astro`, `src/components/sections/Address.astro` (all six as stubs at this stage)
- Modify: `src/pages/index.astro` (composition of six sections in order)
- Test: visual scroll-through + axe DevTools scan

**Approach:**
- `SectionWrapper` props: `id`, `index` (01–06), `title`, `subtitleKo?`, `pinned?: boolean` (Day, Space pass `pinned: true`).
- Renders:
  ```
  <section id={id} aria-labelledby={`${id}-h`}>
    <span class="label-mono" aria-hidden="true">( {index} / {title} )</span>
    <h2 id={`${id}-h`}>
      <slot name="display" />
      <span lang="ko" class="display-ko"><slot name="display-ko" /></span>
    </h2>
    <slot />
  </section>
  ```
- Mono index label position varies asymmetrically per section (Coast top-left, Landmark top-right small caps, Day bottom-left near progress hairline, Window upper-right, Space top-center, Address bottom-right) — controlled by `data-section={id}` selectors in `sections.css`.
- The page has exactly **one `<h1>`** (in Nav.astro: `<h1 class="visually-hidden">WYNDHAM — Songjeong Coastal Landmark</h1>` for screen readers; visible WYNDHAM logo is the brand mark inside the h1). Each section has an `<h2>`. Sub-content within sections may use `<h3>` (Space sub-categories).
- `lang` attributes: `<html lang="ko">` (primary), English copy spans get `lang="en"`. Korean spans on Latin-default body get `lang="ko"`.
- Snap behavior:
  - Default sections (Coast, Landmark, Window, Address): `scroll-snap-align: start` on the wrapper element (consumed by native CSS snap fallback in reduced-motion mode; lenis/snap targets these elements directly via `addElement`).
  - Pinned sections (Day, Space): `scroll-snap-align: none; scroll-snap-stop: normal;` so they don't fight ScrollTrigger pin math.
- `min-height: 100svh; height: 100svh;` paired (not just `min-height`) so pinned content's pin-spacer doesn't grow beyond the snap container. iOS-safe.
- Stubs render only the section label and a placeholder display heading, no motion yet.
- `index.astro` composes: Coast → Landmark → Day → Window → Space → Address.
- Motion module hook: `<script>` block in each section component imports `registry` and is a no-op stub for now; real modules ship in Units 6, 8, 9, 10, 11, 12.

**Patterns to follow:** Astro component conventions; WAI-ARIA APG section pattern; web.dev semantic HTML.

**Test scenarios:**
- axe DevTools scan: 0 critical issues on the stub page (correct landmark structure, heading order, lang attributes).
- Scrolling page proximity-snaps Coast/Landmark/Window/Address; Day/Space DO NOT snap during scroll-through (verified manually).
- Mono section labels render at the correct asymmetric positions per brief examples.
- No layout shift during scroll.
- Each section is exactly `100svh` (verified in DevTools — `height` and `min-height` both resolve to viewport pixels using small-viewport unit).
- VoiceOver/NVDA reads section landmarks in order with correct H2 announcements.
- Build succeeds; static HTML contains all six `<section aria-labelledby>` elements.

**Verification:** A reviewer scrolling top-to-bottom feels the six-act rhythm even without final motion or content. axe scan is clean. Heading outline is correct.

---

- [x] **Unit 6: Section 1 PROLOGUE — discovery reveal + LCP-first hero (vertical slice)**

**Goal:** Production-quality PROLOGUE section. Hero **poster image** is the LCP element (rendered from first paint as `<img fetchpriority="high">`). Video element mounts only after `window.load` event, with AV1+H.264 source ladder. WCAG 2.2.2 pause/play control present. Asymmetric editorial copy reveal; horizon shifts subtly on scroll; transition into Landmark feels like discovery, not a slide.

**Requirements:** R1, R2, R7, R8, R9, R10. **R15** (NEW: WCAG 2.2.2 — autoplay video must expose pause control). Performance: poster ≤ 180 KB AVIF (1920×1080), video ≤ 2.2 MB H.264 + ≤ 1.4 MB AV1, LCP ≤ 2.0 s mobile Slow 4G.

**Dependencies:** Unit 2, Unit 3, Unit 4, Unit 5.

**Files:**
- Create: `src/lib/motion/prologue.ts`, `src/styles/prologue.css`, `src/components/PauseControl.astro` (small mono PAUSE/PLAY text toggle, brass on hover, `aria-label`)
- Modify: `src/components/sections/Coast.astro` (real implementation), `src/layouts/Editorial.astro` (head: `<link rel="preload" as="image" fetchpriority="high" type="image/avif" href={posterAvif1x}>`)
- Test: `tests/motion/prologue.test.ts` (logic-level tests for the timeline factory)
- Asset: `src/assets/placeholders/PROLOGUE-01-poster.{avif,webp,jpg}` (multi-format), `public/videos/PROLOGUE-01.av1.mp4`, `public/videos/PROLOGUE-01.h264.mp4`

**Approach:**

*LCP-first composition:*
1. From first paint, render the poster as `<img>` with `<picture>` AVIF/WebP/JPG fallback, `fetchpriority="high"`, `decoding="async"`, explicit `width`/`height`, `object-fit: cover`. **This is the LCP element.** Preload hint in `<head>`.
2. The `<video>` element is **NOT in initial HTML**. Mount it via the prologue motion module on `window.load` (or after PROLOGUE first scroll event, whichever fires first). Once mounted, `<source>` ladder is AV1 → H.264 (HEVC dropped). Attributes: `autoplay muted loop playsinline preload="metadata"`.
3. When the video starts playing, fade it in over 240 ms above the poster (poster stays underneath as a fallback if the video errors).

*Layout:* full-bleed hero (poster + video both `position: absolute; inset: 0; object-fit: cover`). Copy block placed asymmetrically (e.g., left-aligned at lower-third, NOT centered). Mono label `( 01 / THE COAST )` at top-left small.

*Copy structure (placeholder, real copy from brief):*
- Display: `THE COAST / BEFORE THE LANDMARK`
- Korean support: `랜드마크보다 먼저, / 해안선이 있다.`

*Pause control (R15):*
```
<button class="pause-control" aria-label="Pause hero video" aria-pressed="false">
  <span class="label-mono">PAUSE</span>
</button>
```
Positioned bottom-right small, brass on hover. Toggles `video.paused` and updates `aria-label` ("Pause hero video" / "Play hero video") and `aria-pressed`. Always reachable via keyboard. Visible on focus even if visually muted. Pause control is **always rendered** (a hidden control breaks WCAG 2.2.2 keyboard parity), but its opacity may fade in alongside copy.

*Motion module (`prologue.ts`):*
- All tweens inside `gsap.context(() => { ... }, el)` for atomic teardown.
- On `window.load` or first IntersectionObserver fire: dynamically create `<video>` element, append to hero container, attach `<source>` from `getVideo('PROLOGUE-01')`, fade in 240 ms once `playing` event fires.
- Copy reveal: mono label fades in first (drift 16 px), display second (drift 24 px), Korean third (drift 16 px). Total ≈ 980 ms with `--ease-editorial`. Use GSAP timeline.
- Optionally adopt **GSAP SplitText** (free) for character-level reveal of the display line — saves ~40 LOC and provides screen-reader-safe reconstruction via `aria` attributes. Decide visually here.
- Scroll progress 0 → 1: video+poster container translate Y by 4–6 vh (subtle horizon shift). Use ScrollTrigger scrub.
- Reduced-motion (or Save-Data): no `<video>` mount at all — poster only. Copy fades only (no transform). No scroll-driven transform.

*Layer discipline:* `will-change: transform` only while PROLOGUE pin/scrub is active. Removed on `onLeave`/`onLeaveBack` to free the GPU layer for Landmark.

*Copy contrast:* avoid full-bleed dark gradient overlay (R6 prohibits decorative panels). If contrast against video is insufficient, use a thin top-and-bottom 1–2 vh gradient mask only.

**Patterns to follow:** Established by this unit; future sections mirror the `gsap.context` module shape.

**Test scenarios:**
- Hard refresh on Fast 3G simulation: poster paints within ~1.0–1.4 s; video element does not exist in DOM until `window.load`; once mounted, video first frame fades in around 2.5–3.5 s. No black flash.
- Lighthouse mobile Slow 4G: LCP element is `PROLOGUE-01-poster.avif` (verified in trace), LCP ≤ 2.0 s.
- WCAG 2.2.2 keyboard test: Tab reaches PAUSE control before scroll; pressing Space toggles `video.paused` and updates `aria-label` and `aria-pressed`.
- axe DevTools: 0 critical issues; `aria-pressed` toggles correctly.
- Scroll into Coast: copy reveal sequence completes in ≈ 980 ms with editorial easing.
- Continued scroll: horizon shifts subtly; transition into Landmark feels continuous.
- Reduced-motion: NO video element ever mounts; poster is the entire hero; copy fades without drift; no scroll transform.
- Save-Data: same as reduced-motion (verified by toggling DevTools "Save-Data: on").
- Video error / source unavailable: poster remains visible (fallback works).
- Mobile (≤ 768 px): same behavior; copy size scales down via `clamp()`; PAUSE control still accessible.
- DevTools Performance: `will-change: transform` on hero container is removed when scroll passes Coast (verified in Layers panel).

**Verification:** A reviewer who has never seen the brief feels "discovery", not "advertisement". LCP element is the poster, confirmed in Lighthouse trace. PAUSE control passes WCAG 2.2.2 manually and via axe. The transition into Landmark sets the rhythm for the remaining five sections.

---

- [x] **Unit 7: Phase 1 polish — perf budget validation, a11y, reduced-motion audit, Phase 1.5 token-generalization gate**

**Goal:** PROLOGUE meets the explicit Performance Budget (see Risks section) on Lighthouse mobile Slow 4G profile. Reduced-motion path is fully validated. **Phase 1.5 stub Day frame** validates that PROLOGUE-derived tokens generalize to non-PROLOGUE motion grammar before Phase 2 commits.

**Requirements:** R8, R9, R14, R15.

**Dependencies:** Unit 6.

**Files:**
- Modify: `src/layouts/Editorial.astro` (font preload, metadata, OG tags), `src/lib/motion/engine.ts` (any tuning), `src/components/sections/Coast.astro` (alt text, ARIA), `src/styles/tokens.css` (any newly-required tokens surfaced by the Phase 1.5 stub)
- Create: `public/og-image.jpg` (placeholder), `public/favicon.svg`, `src/pages/_dev/day-stub.astro` (Phase 1.5 single-frame Day prototype, gated by `import.meta.env.DEV`)
- Test: Lighthouse run (manual); axe DevTools scan; explicit budget verification

**Approach:**
- Preload **only the Latin display Regular weight** (LCP-adjacent text in PROLOGUE is English). Pretendard subset KR loads via swap — not preloaded (Korean copy is below the fold of first paint).
- `font-display: swap` on all `@font-face`.
- Image alts derived from `ImageSpec.alt` field — never empty unless decorative (then `alt=""`).
- Color contrast: Ink on Ivory ≥ 7:1 (verified against WCAG); brass tested for ≥ 4.5:1 only where used as text/numerals (NOT large filled areas, which it never is per R4).
- `<main>` landmark, `<nav aria-label="primary">`, all sections have headings in correct level order.
- Skip-to-content link visible on focus.
- Verify reduced-motion in Safari, Chrome, Firefox.

*Phase 1.5 — Token Generalization Gate (NEW):*

Before opening Phase 2, build a single-frame stub of Day section in `_dev/day-stub.astro`:
- One pinned section with a horizontal track containing a single placeholder frame
- One time label using `--font-mono` and `--duration-time-label`
- Bottom progress hairline using `--progress-hairline-h` and `--color-brass`

Validate that the tokens surfaced from PROLOGUE generalize. If new tokens are needed (e.g., a state-cross duration distinct from reveal-base, or a track-gutter that doesn't fit `clamp()`), add them to `tokens.css` here — NOT during Unit 9 retrofit. This avoids the Phase 1 → Phase 2 rework cascade.

The stub is destroyed before Phase 2 begins. Its only purpose is forcing token decisions while Phase 1 is still soft.

**Test scenarios — explicit budget verification:**
- **Lighthouse mobile Slow 4G + 4× CPU slowdown (Lighthouse default):**
  - Performance ≥ 90
  - Accessibility ≥ 95
  - Best Practices ≥ 95
  - SEO ≥ 90
  - LCP ≤ 2.0 s, LCP element = `PROLOGUE-01-poster.avif`
  - TBT ≤ 200 ms
  - CLS ≤ 0.05
- **Bundle inspection:**
  - Total JS gz on first viewport ≤ 90 KB (verified via `du -sh dist/_astro/*.js | sort` and gzip)
  - Total CSS gz ≤ 15 KB
  - Fonts on critical path ≤ 120 KB
  - Total images on first viewport ≤ 250 KB
- **a11y:**
  - axe DevTools scan: 0 critical issues, 0 serious issues
  - VoiceOver/NVDA reads section landmarks in order with H2 announcements
  - Tab order: skip-link → nav links → CONTACT → PAUSE control → page content
  - WCAG 2.2.2 PAUSE control verified by keyboard
- **Reduced-motion:** verified in Safari/Chrome/Firefox; Save-Data emulation also takes the reduced path
- **bfcache:** navigate away and Back; page restores cleanly (verified in Chrome bfcache devtool)
- **Phase 1.5 gate:** day-stub renders correctly using only tokens defined in `tokens.css`; any token additions are made here, not in Unit 9.

**Verification:** Phase 1 is shippable as a one-section editorial preview. Every budget number above is met or the unit is not done. The user can view PROLOGUE alone and decide whether the tone is right before Phase 2 begins, with confidence that tokens won't churn during Phase 2.

---

### Phase 2 — Sections 2–6 + mobile + final polish

- [x] **Unit 8: Section 2 LANDMARK — vertical rise + single horizontal decomposition event**

**Goal:** Building section that establishes "looking up" then "scanning across" as two distinct architectural gestures. Vertical pin scroll moves the camera up the facade; one further scroll triggers a horizontal split where silhouette moves left and a facade detail enters from right.

**Requirements:** R2, R7, R8.

**Dependencies:** Unit 6 (PROLOGUE pattern established).

**Files:**
- Create: `src/lib/motion/landmark.ts`, `src/styles/landmark.css`
- Modify: `src/components/sections/Landmark.astro`
- Test: `tests/motion/landmark.test.ts`
- Assets: LANDMARK-01 (vertical tower placeholder), LANDMARK-02 (facade detail placeholder), LANDMARK-03 (optional media-wall/glass detail)

**Approach:**
- Pin section for `--pin-landmark` (200svh).
- All tweens inside `gsap.context()` for atomic teardown.
- ScrollTrigger options: `pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true, pinSpacing: true`.
- Stage 1 (progress 0 → 0.6): vertical scrub. Tower image's `object-position` shifts from bottom to top, simulating a camera tilt up. Copy on the left stays anchored.
- Stage 2 (progress 0.6 → 1.0): horizontal decomposition. Tower silhouette translates left (≈ −15vw); a second image (facade detail) eases in from right with opacity 0 → 1. **Scale capped at 1.03** final-to-initial (vestibular safety + per WCAG 2.3.3 guidance). Mono caption for the detail image fades in last.
- Copy: `( 02 / VERTICAL ) // A VERTICAL MARK / ON THE SHORE // 송정의 수평선 위에 / 세워지는 수직의 기준.`
- **Layer discipline:** `will-change: transform` applied via `onEnter`/`onEnterBack` and removed via `onLeave`/`onLeaveBack`. `contain: layout paint` on the section wrapper while inactive.
- Stills rendered via Astro `<Image format="avif" widths={[480,960,1440,1920]} sizes="(max-width: 768px) 100vw, 80vw">` from `getImage('LANDMARK-01' | 'LANDMARK-02')`.
- Reduced-motion: stage 1 and stage 2 collapse into a static two-image stacked layout; no scrub.

**Test scenarios:**
- Vertical rise feels like raising one's gaze (smooth, not laggy).
- Horizontal decomposition reads as ONE event, not a slide change.
- Resize during pin: ScrollTrigger refresh recalculates without visual jump.
- Mobile fallback (Unit 13): two stacked images, no horizontal motion.
- Reduced-motion: clean static layout.

**Verification:** A reviewer feels the building was *examined* not *announced*.

---

- [x] **Unit 9: Section 3 SONGJEONG DAY — pinned horizontal time film**

**Goal:** The site's main "wow" moment. Pinned section translates a four-frame image track horizontally as the user scrolls vertically. Time labels (06:12 / 13:40 / 18:27 / 21:05) update in left-anchored copy. Bottom hairline shows progress. Looks nothing like a carousel.

**Requirements:** R2, R7, R8.

**Dependencies:** Unit 8.

**Files:**
- Create: `src/lib/motion/day.ts`, `src/styles/day.css`
- Modify: `src/components/sections/Day.astro`
- Test: `tests/motion/day.test.ts`
- Assets: FLOW-MORNING, FLOW-SURF, FLOW-WALK, FLOW-LIGHT (4 wide placeholders)

**Approach (canonical GSAP pinned-horizontal-track pattern):**

*Structure:*
```
<section class="day" data-pinned="true">              ← TRIGGER + PIN TARGET (outer)
  <div class="day-track">                              ← INNER TRACK (animated)
    <div class="frame"><Image .../></div> × 4
  </div>
  <aside class="day-meta">                             ← left-anchored, NOT pinned individually
    <span class="time-label">06:12 / MORNING</span>
    <p class="time-copy lang-ko">하루는 바다에서 시작되고...</p>
  </aside>
  <div class="day-progress" />                          ← bottom hairline 1px brass
</section>
```

*Tween + ScrollTrigger config:*
```
const ctx = gsap.context(() => {
  gsap.to('.day-track', {
    xPercent: -100 * (frameCount - 1),
    ease: 'none',
    scrollTrigger: {
      trigger: '.day',
      pin: true,
      scrub: 1,
      start: 'top top',
      end: () => '+=' + (track.scrollWidth - window.innerWidth),  // function form, recomputed on refresh
      anticipatePin: 1,
      invalidateOnRefresh: true,
      pinSpacing: true,
    }
  });
}, sectionEl);
```

*Critical rules:*
- Pin the **outer section**, animate the **inner track**. Never animate the pinned element itself.
- `end` is a **function** (not a string) so it recomputes when `invalidateOnRefresh` fires — handles font load, image dimensions, resize.
- `anticipatePin: 1` is mandatory on long pins to avoid flash-of-unpinned-content during fast scroll.
- `invalidateOnRefresh: true` is mandatory because the `xPercent` tween end depends on track width.
- Track CSS: `display: flex; width: max-content; gap: var(--track-gutter)`. Frames are roughly 80 vw each.

*Time labels:* swap content at progress thresholds 0.0 / 0.25 / 0.5 / 0.75 via a separate scrubbed timeline that cross-fades over `--duration-time-label` (280 ms). Label text is data-bound so adding a 5th time would not require code changes.

*Bottom progress hairline:* 1 px brass line that fills 0% → 100% via a scrubbed timeline tied to the same ScrollTrigger.

*Layer discipline:* `will-change: transform` only on `.day-track` while the section is active. `contain: layout paint` on `.day` while non-active. Verifies ≤ 3 composited layers at the Day/Window boundary.

*Carousel rejection rules:* no dots, no arrows, no autoplay timer, no slide UI metaphor. The frame is "edited film", not "browsable items".

*Mobile fallback (Unit 13):* section pinned, four scenes vertically fade-through (cross-dissolve) at the same progress thresholds. Time labels persist. No horizontal pan on touch.

*Reduced-motion:* all four frames stack vertically with time labels; no pin.

*Frames rendered via:* `<Image src={getImage('FLOW-MORNING').import} format="avif" widths={[960, 1440, 1920]} sizes="80vw" loading={i === 0 ? 'eager' : 'lazy'} fetchpriority={i === 0 ? 'high' : 'auto'}>`. Each frame has explicit `width`/`height` attributes (avoids refresh storm).

**Test scenarios:**
- Slow scroll: image track moves smoothly horizontally; time label swaps at correct progress.
- Fast scroll: motion does not "snap" oddly — eases out cleanly.
- Reverse scroll: works symmetrically.
- Resize during pin: track recomputes without leaving the viewport orphaned.
- Reduced-motion: all four frames stack vertically with time labels; no pin.
- Touch (mobile): vertical swipe → vertical fade-through (not horizontal pan, which feels wrong on touch).

**Verification:** This section is the moment most likely to be screenshot/shared. It must read as designed-not-templated.

---

- [x] **Unit 10: Section 4 WINDOW — still main + floating overlay drift**

**Goal:** Quietest section. Main interior view holds nearly still while 1–2 floating editorial frames drift subtly and shift opacity, as if the layout is being re-edited.

**Requirements:** R2, R7, R8.

**Dependencies:** Unit 9.

**Files:**
- Create: `src/lib/motion/window.ts`, `src/styles/window.css`
- Modify: `src/components/sections/Window.astro`
- Test: `tests/motion/window.test.ts`
- Assets: WINDOW-01 (main interior view), WINDOW-02 (floating frame 1), WINDOW-03 (floating frame 2, optional — decide visually)

**Approach:**
- Pin section for `--pin-window` (150svh; less than Day, not the showcase).
- All tweens inside `gsap.context()`. ScrollTrigger options: `pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true`.
- Main image holds still or **scales max 1.02** over full progress (vestibular safety ceiling per WCAG 2.3.3 guidance).
- Floating frames are absolutely positioned at asymmetric coordinates (e.g., one upper-right, one lower-left), each with a small Y-drift (16–32 px) and opacity scrub. Mono captions float beside them at small size.
- Copy: `( 04 / THE WINDOW ) // THE VIEW / IS NOT AN AMENITY // 그것은 이 주소의 본질이다.`
- Decide here: 1 vs 2 floating frames. Default to 2; remove one if composition feels busy.
- **Layer discipline:** `will-change: transform` only on the floating frames while pinned. Main image uses `contain: paint` only — no GPU layer promotion until scrub starts.
- Stills via Astro `<Image>` from `getImage('WINDOW-01' | 'WINDOW-02' | 'WINDOW-03')`.
- Reduced-motion: floating frames render statically at their final positions.

**Test scenarios:**
- Motion is genuinely subtle — must not look like parallax theatrics.
- Floating frames never overlap the main copy block.
- Reduced-motion: clean still composition.
- Mobile: main image static; floating frames stack below in vertical order with their captions; no drift.

**Verification:** Section feels *composed*, not *animated*. If a reviewer notices the motion explicitly, it's too much.

---

- [x] **Unit 11: Section 5 SPACE — three-state crossing transformation**

**Goal:** Information section that escapes the card-grid trap. Three states: sense (image right, evocative copy left) → structure (image crosses left and dominates, sub-categories appear right) → information (image recedes, thin lines/numbers/plan render).

**Requirements:** R2, R7, R8.

**Dependencies:** Unit 10.

**Files:**
- Create: `src/lib/motion/space.ts`, `src/styles/space.css`, `src/data/space-content.ts` (sub-categories list)
- Modify: `src/components/sections/Space.astro`
- Test: `tests/motion/space.test.ts`
- Assets: SPACE-01..N (1 hero image + sub-category visuals, count decided here based on available content)

**Approach (canonical labeled-timeline pattern):**

*Single timeline with three labels and two transitions, scrubbed by ScrollTrigger:*
```
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: '.space',
    pin: true,
    scrub: 1,
    start: 'top top',
    end: () => '+=' + (300 * window.innerHeight / 100),   // --pin-space
    anticipatePin: 1,
    invalidateOnRefresh: true,
    snap: { snapTo: 'labels', duration: { min: 0.2, max: 1 }, ease: 'power1.inOut' },
    // ↑ snap.snapTo:'labels' provides MAGNETIC state landing.
    //   Decide visually whether to keep this (magnetic) or remove (continuous film-like scrub).
  }
});
tl.addLabel('s1')
  .to(['.space-image'], { /* state 1 → 2: image crosses left, scales to dominate */ }, 's1')
  .to(['.space-cats'], { /* sub-category list fades in from right */ }, 's1')
  .addLabel('s2')
  .to(['.space-image'], { /* state 2 → 3: image opacity → 0.4, recedes */ }, 's2')
  .to(['.space-info'], { /* thin line work, room numbers, sqm appear */ }, 's2')
  .addLabel('s3');
```

*State map:*
- **State 1 (sense)** — image right (≈ 60 vw, full height), evocative copy left: `ROOMS / ARE NOT THE STORY. / THE HORIZON IS.` + Korean.
- **State 2 (structure)** — image translates left and scales to dominate ≈ 75 vw; right side shows sub-category names (ROOMS · POOL · DINING · FITNESS · LOUNGE) as vertical mono list with small descriptors.
- **State 3 (information)** — image opacity → 0.4 and recedes; thin line work appears (floor plan stylization, room numbers, sqm figures). All info rendered as text + 1 px hairlines, no cards, no icons.

*Snap decision (deferred to visual review):* `snap.snapTo: 'labels'` makes the three states feel like discrete settling positions (magnetic). Removing it makes the transitions continuous film-like scrub. The choice depends on whether "feeling → structure → information" should feel like a metamorphosis or like a stop-frame edit. Decide here, document the choice in the plan diff.

*Sub-category list:* count is data-driven from `space-content.ts`. Finals can be adjusted without code changes (renders 0..N items based on what the user supplies).

*Layer discipline:* `will-change: transform, opacity` only on `.space-image` while active. `.space-cats` and `.space-info` use no GPU promotion (text-only).

*Stills via:* `getImage('SPACE-HERO')` for the main image; sub-category images optional and lazy-loaded.

*Reduced-motion:* three states stack vertically as separate blocks with full content rendered.

**Test scenarios:**
- State transitions feel like the layout is being re-edited, not slides advancing.
- No card-shaped elements anywhere in the section.
- Mobile: three states stacked vertically (no pin).
- Reduced-motion: identical to mobile fallback.

**Verification:** A reviewer cannot tell whether this section "is" the room list or "is" an editorial spread — it reads as both. That ambiguity is the goal.

---

- [x] **Unit 12: Section 6 EPILOGUE / ADDRESS — poster stop**

**Goal:** Final imprint. Quiet poster screen. Display type fades in. No scroll motion within the section. CONTACT link as small text.

**Requirements:** R3, R10.

**Dependencies:** Unit 11.

**Files:**
- Create: `src/lib/motion/address.ts` (entrance fade only), `src/styles/address.css`
- Modify: `src/components/sections/Address.astro`
- Test: `tests/motion/address.test.ts`
- Asset: EPILOGUE-01 (optional small architectural crop, decide visually)

**Approach:**
- Layout: ivory background. Display type centered or aligned to grid as poster (`SONGJEONG / WILL REMEMBER / THIS ADDRESS`). Below in mono: `WYNDHAM / BUSAN / COASTAL LANDMARK`.
- Optional small image crop bottom-right (EPILOGUE-01) — decide during build whether the page is stronger with or without it.
- Bottom-right or bottom-center: `CONTACT →` text link, small, brass on hover.
- Motion: on section enter, display lines fade in stagger 0 → 1 over ≈ 1100ms with editorial easing. Then nothing — section is still.
- Reduced-motion: instant fade-in only.

**Test scenarios:**
- Section reaches full opacity and stays — no infinite shimmer or breathing animations.
- Page does not auto-scroll back; user can stay on Address as long as they want.
- CONTACT link works as `mailto:` (placeholder until contact mechanism is decided).
- Mobile: same composition; type uses mobile clamp() sizes.

**Verification:** Closing the browser tab on Address feels right. The site doesn't beg the user to act.

---

- [x] **Unit 13: Mobile adaptations + cross-section breakpoint integrity**

**Goal:** All five horizontal/pinned sections cleanly fall back to vertical/stacked patterns on ≤768px. Breakpoint crossing during a session re-initializes motion correctly. Mobile feels premium, not simplified.

**Requirements:** R11.

**Dependencies:** Units 8–12.

**Files:**
- Create: `src/styles/mobile.css`, `src/lib/motion/breakpoint.ts` (matchMedia listener wired to registry.restartAll)
- Modify: each motion module (`landmark.ts`, `day.ts`, `window.ts`, `space.ts`) to branch on breakpoint
- Test: manual device testing + tests/breakpoint.test.ts

**Approach:**
- Breakpoint defined as `(min-width: 769px)`. Below that = mobile choreography.
- Each motion module's `init(el, mode)` branches on `mode` to select desktop vs mobile timeline.
- `breakpoint.ts` listens for `matchMedia('(min-width: 769px)')` change and calls `registry.restartAll(newMode)`. Each module's `gsap.context().revert()` cleans up before re-init.
- Mobile choreography uses cross-fades and stacked reveals — never horizontal pan on touch.
- **Snap behavior on mobile:** `lenis/snap` retuned with softer lerp (e.g., 0.05 instead of 0.1) so the user is not trapped. `type: 'proximity'` already, not mandatory.
- **iOS snap-cache flush pattern:** after every `ScrollTrigger.refresh()` on iOS, dispatch a no-op style mutation on the snap container to flush iOS's stale snap-point cache:
  ```
  if (isIOS) {
    el.style.scrollSnapType = 'none';
    requestAnimationFrame(() => { el.style.scrollSnapType = 'y proximity'; });
  }
  ```
  This is a documented workaround for [WebKit Bug 245722](https://bugs.webkit.org/show_bug.cgi?id=245722).
- Oversized display type uses lower `clamp()` ceiling on mobile.
- `100svh` paired with `height: 100svh` (already in Unit 5) ensures sections don't grow past the snap container with iOS dynamic chrome.

**Test scenarios:**
- Resize browser across 768/769 boundary mid-scroll: layout reflows, motion modules reinit, no visual artifacts.
- iPhone SE (smallest target) viewport: all six sections still readable and feel premium.
- iPhone 15 Pro Max viewport: same.
- iPad portrait: treated as mobile (below 769); landscape as desktop.
- Touch swipe on Day section: vertical fade-through, never horizontal pan.

**Verification:** A reviewer on a phone gets a fully designed experience, not a desktop crop.

---

- [x] **Unit 14: Final polish + Lighthouse pass + deploy preview**

**Goal:** Whole-site Performance Budget met (see Risks section). Lighthouse mobile Slow 4G + 4× CPU slowdown: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90. Open Graph + Twitter card metadata. Favicon. First static deploy preview.

**Requirements:** R14.

**Dependencies:** Units 8–13.

**Files:**
- Modify: `src/layouts/Editorial.astro` (head metadata), `astro.config.mjs` (build target tuning if needed)
- Create: `public/og-image.jpg` (final or upgraded placeholder), `public/favicon.svg`, deploy config (`vercel.json` or `netlify.toml` — one only, decide here)
- Test: Lighthouse run, manual cross-browser

**Approach:**
- Image preload hints for first-view assets only (PROLOGUE-01 poster).
- Video `preload="metadata"` retained.
- Lazy-load images below the fold.
- OG image at 1200×630 with WYNDHAM display + coastal crop.
- HTML `lang="ko"` (primary) with English copy spans marked `lang="en"` for screen readers.
- Static deploy: pick Vercel or Netlify here (defer until this point so the user can confirm).
- Confirm `assets-needed.md` is up to date with every SLOT and any final files the user has provided in the meantime.

**Test scenarios:**
- Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.
- axe DevTools full-site scan: 0 critical issues.
- Cross-browser smoke: Chrome, Safari, Firefox, mobile Safari.
- Deploy preview URL works.

**Verification:** Site is ready to be reviewed as a portfolio piece. Replacing placeholders with finals requires no code changes — only file drops and `assets-needed.md` updates.

## System-Wide Impact

- **Interaction graph:** All scroll motion flows through `src/lib/motion/engine.ts` (Lenis + ScrollTrigger via canonical recipe — GSAP ticker drives Lenis raf, Lenis emits scroll → ScrollTrigger.update). All section motion modules register a `gsap.Context` with `registry.ts`. Reduced-motion, Save-Data, and breakpoint changes broadcast through the registry. **Active-nav state is driven by Lenis scroll progress against pre-declared section ranges** (NOT IntersectionObserver alone — IO fails during long pins). IntersectionObserver remains as a coarse fallback under reduced-motion.

- **Error propagation:** Failed module init in any section must not break neighbors. Each `init()` is wrapped in try/catch in the registry; errors log to console but do not throw. If a module fails, its section degrades to its reduced-motion static layout. The asset manifest's typed split (`getImage`/`getVideo`) means malformed manifest entries fail at build time, not runtime.

- **State lifecycle (canonical sequence — drives every pinned section):**
  ```
  1. construct triggers (idempotent)
  2. await document.fonts.ready          → ScrollTrigger.refresh()
  3. window 'load' event                 → ScrollTrigger.refresh()
  4. each <video> 'loadedmetadata'       → 150ms-debounced ScrollTrigger.refresh(true)
  5. lazy <img> with explicit w/h        → no refresh needed (preferred)
     lazy <img> WITHOUT explicit dims    → 'load' → debounced refresh
  6. orientationchange + debounced resize→ ScrollTrigger handles
     (because ScrollTrigger.config({ ignoreMobileResize: true }) suppresses iOS URL-bar churn)
  7. all post-boot calls use refresh(true) (safe form, doesn't interrupt active scroll)
  ```
  Pinned-section ends MUST be functions, not strings, so `invalidateOnRefresh: true` recomputes them on every refresh.

- **bfcache lifecycle:** Lenis + autoplay video can disqualify the page from bfcache. Engine binds `pagehide` → `engine.stop()` and `pageshow` (where `event.persisted === true`) → `ScrollTrigger.refresh()` + `engine.start()`. This is the only contract that lets back/forward navigation restore correctly.

- **HMR contract (dev only):** Every motion module ends with
  ```
  if (import.meta.hot) {
    import.meta.hot.dispose(() => registry.destroy(MODULE_ID));
  }
  ```
  Without this, Vite HMR replaces module exports without lifecycle, leaking ScrollTriggers across edits. After 10 minutes of dev work the page would have dozens of stale pins. The plan's productivity depends on this being non-optional.

- **API surface parity:** Asset manifest is the only content API. Components consume `getImage(slotId)` (Astro `ImageMetadata`) or `getVideo(slotId)` (`<source>` ladder + poster). Components must never reference `public/` or `src/assets/` paths directly.

- **Layer / paint discipline:** Only the active pin's animated child gets `will-change: transform`. Removed on `onLeave`/`onLeaveBack`. Inactive sections get `contain: layout paint`. Verified via DevTools Layers panel: ≤ 3 composited layers at any pin boundary. Prevents stacked-pin paint pressure on mobile (5 pins × 1080×2400 × 4 B = ~200 MB peak GPU memory if naively promoted).

- **Integration coverage:** Cross-section scrolling (top to bottom and reverse) is the primary integration test. Verify on full build, not just per-section dev. Pin boundaries (Landmark/Day, Day/Window, Window/Space) are the highest-risk transition zones — manual scroll-through on a real Android mid-tier device is required before Phase 2 sign-off.

## Risks & Dependencies

### Performance Budget (HARD targets — Unit 7 + Unit 14 verification gates)

| Metric | Target | Tooling |
|---|---|---|
| LCP (mobile Slow 4G + 4× CPU) | ≤ 2.0 s | Lighthouse, LCP element MUST be `PROLOGUE-01-poster.avif` |
| TBT | ≤ 200 ms | Lighthouse |
| CLS | ≤ 0.05 | Lighthouse + manual Day pin transition |
| Total JS gzipped (initial bundle) | ≤ 90 KB | `du -sh dist/_astro/*.js` + gzip |
| Total CSS gzipped | ≤ 15 KB | same |
| Fonts on critical path | ≤ 120 KB | Network tab |
| Total images on first viewport | ≤ 250 KB | Network tab |
| Hero poster (PROLOGUE-01) | ≤ 180 KB AVIF / ≤ 240 KB WebP at 1920×1080 | manifest |
| Hero video AV1 | ≤ 1.4 MB | manifest |
| Hero video H.264 fallback | ≤ 2.2 MB | manifest |
| Median image AVIF mobile-1x | ≤ 80 KB | Astro `<Image>` |
| Lighthouse mobile Performance | ≥ 90 | required for R14 |
| Lighthouse mobile Accessibility | ≥ 95 | required for R14 |
| Lighthouse mobile Best Practices | ≥ 95 | aspirational |
| Lenis idle CPU (no user input) | ≤ 0.5% | DevTools Performance |
| Composited layers at pin boundary | ≤ 3 | DevTools Layers panel |

If any metric is missed, Unit 7 (for PROLOGUE) or Unit 14 (for full site) is not done.

### Risks

- **Lenis + ScrollTrigger pin desync.** Risk: dual scroll sources cause pin offsets to drift. *Mitigation:* canonical integration recipe (engine.ts) — GSAP ticker drives Lenis raf, Lenis emits scroll → ScrollTrigger.update; `autoRaf: false`; `gsap.ticker.lagSmoothing(0)`. No `scrollerProxy` for body-level Lenis.

- **Lenis × native CSS scroll-snap conflict.** Risk: Lenis explicitly does not support CSS scroll-snap (per Lenis README). Combining them produces silent failures and visible jitter. *Mitigation:* use `lenis/snap` plugin with `type: 'proximity'`; native CSS snap only as reduced-motion fallback when Lenis is destroyed.

- **iOS Safari URL-bar resize storm.** Risk: every URL-bar collapse fires `resize` → `ScrollTrigger.refresh()` recomputes all 5 pins (~40–120 ms per refresh on mid-tier device). Cumulative jank. *Mitigation:* `ScrollTrigger.config({ ignoreMobileResize: true })` suppresses URL-bar-driven refreshes. iOS snap-cache flush pattern after every refresh on iOS.

- **WCAG 2.2.2 autoplay video pause control (R15).** Risk: shipping autoplay-loop hero video without an explicit pause control fails WCAG 2.2.2 Level A. `prefers-reduced-motion` alone is insufficient. *Mitigation:* always-rendered keyboard-reachable PAUSE/PLAY control with `aria-label` and `aria-pressed` (Unit 6).

- **bfcache disqualification.** Risk: Lenis + autoplay video disqualifies the page from bfcache; back/forward feels broken. *Mitigation:* `pagehide`/`pageshow` handlers in engine.ts; `engine.stop()` on pagehide, refresh + start on pageshow with `event.persisted === true`.

- **Vite HMR ScrollTrigger leak.** Risk: dev server replaces motion modules without lifecycle; after 10 minutes of edits the page has dozens of stale pins. *Mitigation:* every motion module ends with `import.meta.hot?.dispose(() => registry.destroy(MODULE_ID))`. Non-optional.

- **GSAP context teardown discipline.** Risk: each motion module creates multiple ScrollTriggers; without explicit ownership, `restartAll()` leaks them across breakpoint flips. *Mitigation:* every module's `init()` returns a `gsap.Context`; `destroy()` calls `ctx.revert()` which atomically kills every tween/trigger created inside.

- **Reduced-motion incomplete.** Risk: shipping a site that paginates badly or shows broken layouts when reduce-motion is on. *Mitigation:* `engine.stop()` + `registry.destroyAll()` collapses everything to static; each section's reduced-motion path is explicitly tested in Unit 7 and re-tested per section. Save-Data and slow effectiveType take the same path (covers ~6–10% of APAC mobile).

- **FOIT/FOUT breaks first-impression timing.** Risk: display fonts loading mid-reveal makes the first 980 ms feel cheap. *Mitigation:* `font-display: swap`; preload only the Latin display Regular weight (LCP-adjacent); Pretendard subset KR loads via swap (Korean is below the fold of first paint).

- **Stacked pin paint pressure.** Risk: 5 pinned sections × full-viewport rasters can push iOS Safari toward tab kill (≥ 256 MB GPU). *Mitigation:* `will-change: transform` only on active pin's animated child; `contain: layout paint` on inactive sections. Verified ≤ 3 composited layers at boundaries.

- **Hero LCP measured against video, not poster.** Risk: Chrome's LCP heuristic can attribute LCP to the autoplaying video's first frame, blowing the budget. *Mitigation:* render poster as plain `<img fetchpriority="high">` from first paint; mount `<video>` element only after `window.load`. LCP element confirmed via Lighthouse trace = poster.

- **Pretendard full pack would crush bundle.** Risk: full Pretendard is ~3 MB. *Mitigation:* subset KR (`pretendard-dynamic-subset` or `pyftsubset` Hangul Syllables block) → ~80–120 KB woff2 per weight.

- **Vestibular accessibility beyond reduced-motion.** Risk: scale tweens > 1.05, horizontal scrub on touch, and pinned scrub-driven motion can trigger motion sickness even with subtle amplitudes. *Mitigation:* scale capped at 1.03 (Landmark) and 1.02 (Window); Day's horizontal pan converts to vertical fade-through on touch; scrub motion always honors reduced-motion.

- **Tailwind v4 + Astro stability.** Risk: Tailwind v4 stable was released 2025-01-22; Astro 5.2+ supports it via `@tailwindcss/vite` (NOT the deprecated `@astrojs/tailwind` integration). *Mitigation:* pin Astro `^5.2`; use `@tailwindcss/vite`; verify `dist/_astro/` contains hashed Tailwind utility CSS as proof the pipeline is wired.

- **GSAP licensing.** Risk: historical concern about Club GreenSock plugins. *Mitigation:* GSAP and all plugins (incl. SplitText, ScrollTrigger, ScrollSmoother, MorphSVG) are FREE under standard "no charge" license post-Webflow acquisition (2024+, unchanged 2026). Documented and confirmed. License URL: https://gsap.com/standard-license.

- **Korean glyph metric drift.** Risk: chosen Latin display face has different metrics from Pretendard, causing inline KR/EN mixes to bob. *Mitigation:* pair with Inter Tight (Pretendard's metric-source family); use `font-size-adjust: from-font` on the Latin face to auto-sync x-heights.

- **Asset manifest abstraction missing responsive variants.** Risk: a thin `AssetSpec` shape can't express srcset, codec ladder, or mobile vs desktop crops, fighting Astro `<Image>`. *Mitigation:* typed split — `ImageSpec` uses `import: ImageMetadata` from `src/assets/`; `VideoSpec` uses `public/`-relative `<source>` ladder + `ImageMetadata` poster.

- **Phase 1 token under-coverage.** Risk: PROLOGUE-only tokens may not generalize to Day's track or Space's 3-state. *Mitigation:* Phase 1.5 stub Day frame in `_dev/day-stub.astro` (Unit 7) forces token surface decisions before Phase 2 commits.

- **No AGENTS.md / CLAUDE.md guidance** to inherit from in a fresh repo. *Mitigation:* this plan is the canonical guidance until the codebase establishes its own.

## Phased Delivery

### Phase 1 — Foundation + PROLOGUE (Units 1–7)

**Outcome:** Buildable, deployable single-section editorial preview. The user can open it, scroll, and decide whether the tonal system holds.

**Decision gate before Phase 2:**
- Does PROLOGUE feel like *discovery*?
- Is the smooth scroll buttery without being slippery?
- Are the design tokens producing the right tonal output?
- Is the reduced-motion path clean?

If yes → proceed to Phase 2. If no → iterate on Phase 1 before scaling. Do not build five more sections on a system that hasn't earned its first.

### Phase 2 — Sections 2–6 + mobile + final polish (Units 8–14)

**Outcome:** Complete six-section site, mobile-grade, perf/a11y validated, deployable preview live.

## Documentation Plan

- **`docs/brainstorms/2026-04-27-songjeong-landmark-brief.md`** — origin brief (already in place).
- **`docs/plans/2026-04-27-001-feat-songjeong-landmark-site-plan.md`** — this plan.
- **`docs/assets-needed.md`** — living asset manifest. Updated whenever a SLOT-ID is added or filled.
- **`README.md`** — minimal: project intent (one paragraph), `pnpm` commands, link to brief and plan. No marketing copy.
- **Inline code comments** — only where motion math, easing rationale, or browser-quirk workarounds are non-obvious. Prefer naming over comments.

## Operational / Rollout Notes

- **Deploy target** decided in Unit 14 (Vercel or Netlify, single choice). Static output → no runtime concerns.
- **No analytics, no marketing pixels, no cookie banner** in this scope. If added later, it must respect the editorial reservation (no overlay banners, no large modals).
- **Asset replacement workflow:** user drops final files into `public/finals/`, edits `final` field for each SLOT-ID in `src/data/asset-manifest.ts`, edits the corresponding row in `assets-needed.md`. No component edits required.
- **Versioning:** semver irrelevant for this single-page site; tag releases as `phase-1`, `phase-2-rc1`, `v1.0` if useful.

## Sources & References

- **Origin document:** [`docs/brainstorms/2026-04-27-songjeong-landmark-brief.md`](../brainstorms/2026-04-27-songjeong-landmark-brief.md)
- **Reference assets** (not imported): `~/Desktop/hotel_info/` — promo videos, CG, brochures, EXORDIUM_WYNDHAM materials. For tonal understanding only.
- **External docs (curated during deepening pass):**
  - **Astro 5.2 release notes:** https://astro.build/blog/astro-520/ (native Tailwind v4 support)
  - **Tailwind CSS — Astro install guide:** https://tailwindcss.com/docs/installation/framework-guides/astro
  - **Astro `@astrojs/tailwind` deprecation note:** https://docs.astro.build/en/guides/integrations-guide/tailwind/
  - **GSAP ScrollTrigger docs:** https://gsap.com/docs/v3/Plugins/ScrollTrigger/
  - **GSAP `ScrollTrigger.refresh()`:** https://gsap.com/docs/v3/Plugins/ScrollTrigger/refresh()/
  - **GSAP Timeline `addLabel`:** https://gsap.com/docs/v3/GSAP/Timeline/addLabel()
  - **GSAP standard "no charge" license:** https://gsap.com/standard-license
  - **GSAP pricing (free for commercial use):** https://gsap.com/pricing/
  - **GSAP forum — Lenis sync patterns:** https://gsap.com/community/forums/topic/40426-patterns-for-synchronizing-scrolltrigger-and-lenis-in-reactnext/
  - **GSAP forum — `loading="lazy"` + ScrollTrigger refresh:** https://gsap.com/community/forums/topic/36860-loadinglazy-and-scrolltriggerrefresh/
  - **Lenis (darkroomengineering):** https://github.com/darkroomengineering/lenis
  - **Lenis npm:** https://www.npmjs.com/package/lenis
  - **WebKit Bug 245722 — scroll-snap fails on iOS:** https://bugs.webkit.org/show_bug.cgi?id=245722
  - **WCAG 2.2.2 Pause, Stop, Hide:** https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html
  - **WCAG 2.3.3 Animations from Interactions:** https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html
  - **Pope.tech — Design accessible animation (Dec 2025):** https://blog.pope.tech/2025/12/08/design-accessible-animation-and-movement/
  - **Aaron Grogg — Improving LCP for Video Hero (Jan 2026):** https://aarontgrogg.com/blog/2026/01/06/improving-lcp-for-video-hero-components/
  - **DebugBear — Optimize Video LCP:** https://www.debugbear.com/blog/optimize-video-lcp
  - **web.dev — Video performance:** https://web.dev/learn/performance/video-performance
  - **Codrops — Astro+GSAP editorial build (Feb 2026):** https://tympanus.net/codrops/2026/02/18/joffrey-spitzer-portfolio-a-minimalist-astro-gsap-build-with-reveals-flip-transitions-and-subtle-motion/
  - **Pretendard (Korean type, orioncactus):** https://github.com/orioncactus/pretendard
  - **Webflow — GSAP becomes free:** https://webflow.com/blog/gsap-becomes-free
  - **caniuse — AV1:** https://caniuse.com/av1
