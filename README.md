# Songjeong Landmark (WYNDHAM)

Single-page editorial website for a coastal landmark hotel in Busan Songjeong.
Six-section scroll-driven experience — discovery and memorability over booking pressure.

Built with Astro 5.2 + Tailwind v4 + GSAP 3 (free standard license) + Lenis 1.x.
TypeScript strict, pnpm. Static output, no SSR.

## Sections (in scroll order)

1. **Coast** — vertical snap, slow horizon shift, asymmetric copy reveal. LCP-first hero (poster paints first, video mounts on `window.load`). WCAG 2.2.2 PAUSE control.
2. **Landmark** — pinned 200svh; vertical rise (Stage 1) → single horizontal decomposition (Stage 2) revealing facade detail beside the silhouette.
3. **Songjeong Day** — pinned 400svh horizontal time film. Four frames (06:12 / 13:40 / 18:27 / 21:05) translate horizontally as the user scrolls vertically. Brass progress hairline. Mobile/touch: vertical fade-through.
4. **Window** — pinned 150svh. Main interior view holds nearly still while two floating editorial frames drift Y 16–32px and shift opacity. Quietest section.
5. **Space** — pinned 300svh, labeled timeline with magnetic snap. Three states: sense → structure → information. No card UI; sub-categories render as a vertical mono list.
6. **Address** — final imprint. Display fades in once with 1.1s stagger; section is still after.

## Stack

- **Astro ^5.2** static output, `@tailwindcss/vite` (Tailwind v4 CSS-first `@theme`).
- **GSAP 3** + **ScrollTrigger** — pin/scrub choreography. Free under standard license post-Webflow.
- **Lenis 1.x** — editorial smooth scroll (`autoRaf: false`; GSAP ticker drives `lenis.raf`).
- **lenis/snap** plugin (`type: 'proximity'`) — magnetic snap; pinned sections opt out.
- Per-section motion modules with `gsap.context()` for atomic teardown.
- Lifecycle gates: `prefers-reduced-motion`, Save-Data / slow effectiveType, breakpoint flip, bfcache `pagehide` / `pageshow`, Vite HMR `import.meta.hot.dispose`.

## Performance budget (mobile, gzipped)

| Metric | Target | Actual |
|---|---|---|
| Eager JS bundle (first viewport) | ≤ 90 KB | ~38 KB |
| Lazy section modules (loaded on intersection) | — | ~4 KB total |
| ScrollTrigger plugin | — | 18 KB |
| CSS bundle | ≤ 15 KB | ~6 KB |
| Critical-path Latin fonts | ≤ 120 KB | 43 KB |
| Hero poster AVIF (1920w) | ≤ 180 KB | 105 KB |
| Hero video AV1 / H.264 | ≤ 1.4 MB / 2.2 MB | 397 KB / 1.05 MB |

Initial bundle ships only the engine, registry, lifecycle gates, and the PROLOGUE module. Sections 2–6 lazy-load via `IntersectionObserver` (rootMargin 50%).

## Commands

```sh
pnpm install      # install dependencies
pnpm dev          # http://localhost:4321
pnpm build        # static build to dist/
pnpm preview      # preview the production build
pnpm typecheck    # astro check
pnpm format       # prettier --write
```

## DEV-only routes (404 in production)

- `/dev/tokens` — design-token preview (color, type ramp, motion easing, structure).
- `/dev/day-stub` — Phase 1.5 token-generalization stub for the Day section.

## Asset replacement workflow

All media references resolve through SLOT-IDs in `src/data/asset-manifest.ts`. To swap a placeholder:

1. Drop the final file into `src/assets/placeholders/` (stills) or `public/videos/` (video).
2. Edit the `final` field for the SLOT in `src/data/asset-manifest.ts`.
3. Update the corresponding row in `docs/assets-needed.md`.

No component edits required.

## Documents

- Brief: `docs/brainstorms/2026-04-27-songjeong-landmark-brief.md`
- Plan: `docs/plans/2026-04-27-001-feat-songjeong-landmark-site-plan.md`
- Asset manifest: `docs/assets-needed.md`
