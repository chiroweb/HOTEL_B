# Assets Needed — Songjeong Landmark (WYNDHAM)

Single source of truth for media slots. Each row pairs a SLOT-ID with the
section it serves, the kind of media expected, and tonal direction. This file
and `src/data/asset-manifest.ts` are kept in sync.

> **Tone reminder.** All photography/video must read warm-desaturated, cinematic,
> portfolio-grade. No saturated tourism imagery. No advertisement framing.

> **Replacement workflow.** Drop the final file into `src/assets/placeholders/`
> (stills) or `public/videos/` (video). Add a `final:` field to the SLOT entry
> in `src/data/asset-manifest.ts`. Update this row's status. No component edits.

---

## Phase 1 — required for PROLOGUE

| SLOT-ID         | Section  | Kind  | Aspect / Duration | Tone notes                                                                             | Codec ladder (video)                | Current file                                                  | Final file (status) | Notes                                                                              |
| --------------- | -------- | ----- | ----------------- | -------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------- |
| **PROLOGUE-01** | Coast    | image | 16:9 (1920×1080)  | Warm-desaturated coastal horizon. "Before the landmark, there is the coast."           | —                                   | `src/assets/placeholders/PROLOGUE-01-poster.{avif,webp,jpg}`  | (placeholder)       | Synthetic ImageMagick composite. Replace with real Songjeong coast photograph.     |
| **PROLOGUE-01** | Coast    | video | 16:9, 5–8 s loop  | Slow ken-burns or static observed coastal scene. Loop-friendly. No cuts, no narrative. | AV1 (av01.0.05M.08) → H.264 (high)  | `public/videos/PROLOGUE-01.{av1,h264}.mp4`                    | (placeholder)       | Synthetic ffmpeg ken-burns from poster. Replace with cinematic coastal footage.    |

---

## Phase 2 — pending

| SLOT-ID          | Section   | Kind  | Aspect / Duration | Tone notes                                                                                  | Codec ladder (video) | Current file | Final file (status) | Notes                                                                                   |
| ---------------- | --------- | ----- | ----------------- | ------------------------------------------------------------------------------------------- | -------------------- | ------------ | ------------------- | --------------------------------------------------------------------------------------- |
| **LANDMARK-01**  | Landmark  | image | 9:16 portrait (1080×1920) | Tower silhouette against sky. Dawn or dusk grade. Architectural, not advertorial.           | —                    | `src/assets/placeholders/LANDMARK-01.{avif,webp,jpg}` | (placeholder)       | Synthetic ImageMagick composite. Camera tilt-up framing.                                |
| **LANDMARK-02**  | Landmark  | image | 4:5 portrait (1200×1500) | Facade detail — material, glass, edge. Macro feel.                                          | —                    | `src/assets/placeholders/LANDMARK-02.{avif,webp,jpg}` | (placeholder)       | Synthetic ImageMagick grid composite. Enters from right during horizontal decomposition. |
| **LANDMARK-03**  | Landmark  | image | 1:1 (optional)    | Glass / media-wall detail. Optional.                                                        | —                    | (skipped Phase 1)    | (pending)           | Composition decision: 2-image stage suffices; LANDMARK-03 deferred.                     |
| **FLOW-MORNING** | Day       | image | 21:9 (1920×823)   | 06:12 — first light on the water. Cool-warm gradient.                                       | —                    | `src/assets/placeholders/FLOW-MORNING.{avif,webp,jpg}` | (placeholder)       | Synthetic ImageMagick gradient. First frame.                                            |
| **FLOW-SURF**    | Day       | image | 21:9 (1920×823)   | 13:40 — surf line, mid-day quiet, no figures or 1–2 silhouettes max.                        | —                    | `src/assets/placeholders/FLOW-SURF.{avif,webp,jpg}`    | (placeholder)       | Synthetic warm noon gradient. Second frame.                                             |
| **FLOW-WALK**    | Day       | image | 21:9 (1920×823)   | 18:27 — walking pace late afternoon, golden hour but restrained.                            | —                    | `src/assets/placeholders/FLOW-WALK.{avif,webp,jpg}`    | (placeholder)       | Synthetic golden-hour gradient. Third frame.                                            |
| **FLOW-LIGHT**   | Day       | image | 21:9 (1920×823)   | 21:05 — lights on, deep blue hour. Building presence implied, not centered.                 | —                    | `src/assets/placeholders/FLOW-LIGHT.{avif,webp,jpg}`   | (placeholder)       | Synthetic blue-hour with brass light flecks. Fourth frame.                              |
| **WINDOW-01**    | Window    | image | 16:9 (1920×1080)  | Main interior view from the room's perspective. Quiet. View dominant, room incidental.      | —                    | `src/assets/placeholders/WINDOW-01.{avif,webp,jpg}`    | (placeholder)       | Synthetic ImageMagick interior with framed window onto distant horizon.                 |
| **WINDOW-02**    | Window    | image | 4:3 (800×600)     | Floating editorial frame. Detail (cup, sill, fabric, light).                                | —                    | `src/assets/placeholders/WINDOW-02.{avif,webp,jpg}`    | (placeholder)       | Synthetic warm still-life. Drifts with subtle Y translation.                            |
| **WINDOW-03**    | Window    | image | 4:3 (800×600)     | Floating editorial frame, optional second.                                                  | —                    | `src/assets/placeholders/WINDOW-03.{avif,webp,jpg}`    | (placeholder)       | Synthetic cooler atmospheric detail. Composition uses 2 floating frames.                |
| **SPACE-HERO**   | Space     | image | 3:4 portrait      | Single hero image of architectural space. Spans state-1 → state-2 transformation.           | —                    | (pending)    | (pending)           | Crosses from right to dominant left during 3-state timeline.                            |
| **SPACE-…**      | Space     | image | varies            | Sub-category visuals (rooms / pool / dining / fitness / lounge). Count decided in Unit 11.  | —                    | (pending)    | (pending)           | Lazy-loaded.                                                                            |
| **EPILOGUE-01**  | Address   | image | 1:1 (optional)    | Small architectural crop bottom-right. Optional — decide visually during Unit 12.           | —                    | (pending)    | (pending)           | Address section is intentionally still; no motion on this slot.                         |

---

## Conventions

- **Stills naming**: `<SECTION>-<NN>-<role>.{avif,webp,jpg}` for multi-format
  delivery; the `.jpg` (or single AVIF) is what Astro imports — Astro emits
  AVIF/WebP variants automatically at build time.
- **Video naming**: `<SECTION>-<NN>.<codec>.mp4`. AV1 first, H.264 fallback.
  HEVC dropped — Safari-only with no payoff over AV1+H.264 pair.
- **Aspect strictness**: deliver at exact aspect (no letterbox / pillarbox).
  Astro responsive variants handle viewport scaling.
- **Color**: warm-desaturated (~−40 saturation vs straight camera output is a
  good starting reference). Reject saturated tourism grades.
- **People**: avoid identifiable faces. Silhouettes only. Editorial preference.
