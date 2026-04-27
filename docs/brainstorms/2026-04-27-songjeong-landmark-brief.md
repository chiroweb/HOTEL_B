# Songjeong Landmark Hotel — Website Master Prompt

## Role

You are a world-class editorial web designer and motion-focused creative director.
Design a premium hotel website for a landmark coastal hotel in Busan Songjeong.
The result must feel like a designer portfolio piece, not a generic hotel, resort, or real-estate sales page.

This website is **not mainly for immediate booking**.
It must create **desire, ownership, elegance, and memorability** through space, rhythm, photography, typography, and scroll behavior.

---

## Core Concept

Design the website around this idea:

> **A new coastal landmark, discovered through the act of scrolling.**

The user should not feel that they are reading a hotel website.
They should feel that they are traveling through the coastline, discovering the building, entering the view, and finally remembering the address.

The website must communicate:

- Busan Songjeong coastal landmark
- Oceanfront presence
- Vertical architectural identity
- Premium ownership desire
- Elegant restraint
- Editorial confidence
- Quiet luxury

**Do not** over-explain. Do not sell loudly. Do not make it look like a reservation page.

---

## Important Context

The current hotel materials are reference-only.
Images, CG, and videos may be recolored, regenerated, retouched, or replaced later.
Use them only to understand the hotel:

- A tall landmark hotel on the Busan coastline
- Strong ocean view and beach adjacency
- High-rise architectural mass
- Premium hospitality and possible residence-style ownership
- Coastal lifestyle: morning sea, surfing, promenade, evening light
- A powerful window/view experience

Do not lock the design to the current raw image quality.
The final visual system must assume refined photography and carefully graded assets.

---

## Design Standard

This must be designed at the level of a top-tier Korean design studio portfolio.

**Avoid anything that feels like:**

- Template hotel site
- Real-estate sales landing page
- Generic luxury resort page
- Icon-card section
- Facility list page
- Booking-first UX
- Excessive CTA page
- AI-generated trendy layout without discipline

The site must feel expensive **because** it is restrained, precise, and memorable.

---

## Visual Direction

### Color

Use a restrained editorial palette.

**Primary:**
- Ivory, warm cream, soft off-white
- Deep black or near-black
- Warm muted gray/tan hairlines

**Accent:**
- Choose only one small accent system: brass **or** deep navy
- Use accents only for tiny labels, lines, numerals, or subtle active states
- Never use accent colors as large filled sections

**Avoid:**
- Purple gradients
- Blue-purple SaaS gradients
- Beige-heavy monotony without contrast
- Glassmorphism
- Decorative glow
- Floating gradient blobs
- Stock luxury gold overload

### Typography

The typography must carry the design.

**Use:**
- Large uppercase English display typography
- Short Korean supporting lines
- Mono labels for section indexes, captions, and structural markers
- Strong contrast between huge poetic display copy and tiny technical labels

**Suggested type direction:**
- **Display:** sharp grotesk, Inter Tight / Neue Haas style
- **Body:** clean neutral sans
- **Mono:** JetBrains Mono / Söhne Mono style

**Rules:**
- Large type is structure, not decoration
- Korean copy must be short, confident, and calm
- Avoid marketing cliches
- Avoid long paragraphs
- Do not use emotional luxury adjectives repeatedly

### Lines, Frames, Surfaces

**Use:**
- 1px hairline rules
- Sharp edges
- Editorial image frames
- Large negative space
- Asymmetric grids

**Avoid:**
- Rounded cards
- Heavy shadows
- Floating CTA cards
- Nested cards
- Decorative panels
- Pill buttons
- Soft SaaS UI shapes

Radius should be **0px by default**.
If necessary, use 2px to 4px maximum only for functional interface details.

### Photography And Media

**Photography should feel:**
- Warm
- Slightly desaturated
- Cinematic but not artificial
- Editorial
- Architectural
- Calm
- Expensive

**Useful image categories:**
- Wide coastal drone shot
- Hotel building from the shoreline
- Vertical tower crop
- Facade / media wall detail
- Beach lifestyle
- Morning water
- Surfing or promenade
- Evening light
- Interior window looking over the sea
- Small detail images for editorial overlays

**Avoid:**
- Over-saturated travel photography
- Generic smiling hotel guests
- Stock spa images
- Fake-looking luxury interiors
- Random amenities with no narrative purpose

---

## Motion Philosophy

The website uses **magnetic scroll behavior**.
Each major section should snap into place, but the whole site must not feel like six identical full-page slides.

**The motion must feel like:**
- Discovery
- Quiet opening
- Editorial page turning
- Controlled cinematic travel

**Avoid:**
- Bouncy animation
- Fast pop-in effects
- Excessive parallax
- 3D rotation
- Mouse trails
- Custom cursor tricks
- Infinite image zoom loops
- Motion that exists only to show off

**Recommended motion:**
- Slow reveal: **720ms to 1100ms**
- Ease: `cubic-bezier(0.22, 1, 0.36, 1)`
- Opacity and transform only
- Small vertical drift: **16px to 32px**
- Full-section transitions: **600ms or slower**
- Respect reduced-motion settings

---

## CTA Strategy

**Do not create a separate CTA section.**

**Reason:** The site is not currently built around immediate booking.
A large CTA section would damage the atmosphere and make the experience feel like a sales page.

**CTA placement:**
- Small top navigation item: `CONTACT` or `INQUIRY`
- Optional final small text link in the last section
- Keep it quiet, typographic, and secondary

**Do not use:**
- Big reservation block
- Floating booking widget
- Sticky sales banner
- Countdown or urgency UI
- Repeated inquiry buttons inside every section

---

## Navigation

Navigation should be minimal and almost editorial.

**Suggested nav:**
- Logo / hotel name on left
- Small section index or menu on right
- `CONTACT` as a small text link

The nav may be sticky, but it must not dominate.
Use a thin bottom hairline if needed.

**Possible nav labels:**
- COAST
- LANDMARK
- FLOW
- WINDOW
- SPACE
- ADDRESS

Use labels sparingly. The page should not feel like a corporate brochure.

---

## Page Structure

Use **six main sections**.
Each section fills the screen or nearly fills the screen.
Each section has a different scroll behavior or spatial rhythm.

| # | Section | Theme |
|---|---------|-------|
| 01 | PROLOGUE | THE COAST |
| 02 | LANDMARK | THE VERTICAL SIGN |
| 03 | FLOW | ONE DAY ON SONGJEONG |
| 04 | WINDOW | OWN THE VIEW |
| 05 | SPACE | ROOMS & AMENITY |
| 06 | EPILOGUE | ADDRESS |

---

### Section 1 — PROLOGUE / THE COAST

**Purpose**
Start with the coastline, not the hotel. The hotel should feel discovered, not advertised.

**Visual**
Full-screen coastal ocean image or video. Prefer a wide drone shot, horizon line, or quiet beach scene.

**Layout**
Minimal text. Place copy asymmetrically, not centered by default. Use a small mono section label.

**Example**
```
( 01 / THE COAST )

THE COAST
BEFORE THE LANDMARK

랜드마크보다 먼저,
해안선이 있다.
```

**Scroll Behavior**
On the first scroll, do not simply move down. Let the horizon shift slowly and reveal the idea of the hotel. The next section should feel like the building is being discovered from the coastline.

**Avoid**
- Huge logo over the image
- Immediate reservation CTA
- Centered resort slogan
- Dark overlay with generic white text

---

### Section 2 — LANDMARK / THE VERTICAL SIGN

**Purpose**
Declare the building as a new vertical sign on the shoreline.

**Visual**
Use the tower, facade, mass, or architectural CG. The image should emphasize height and presence.

**Layout**
The building should dominate. Text should be restrained and structural.

Possible composition:
- **Left:** fixed text and section label
- **Right or center:** vertical tower image
- **During scroll:** camera or crop moves upward along the facade

**Example**
```
( 02 / VERTICAL )

A VERTICAL MARK
ON THE SHORE

송정의 수평선 위에
세워지는 수직의 기준.
```

**Scroll Behavior**
Two-step snap inside the section:
1. Full building silhouette
2. Facade / media wall / upper tower close-up

The user should feel as if they are raising their gaze.

**Avoid**
- Standard architecture description block
- Stats-first real-estate layout
- Three feature cards
- Loud gold luxury treatment

---

### Section 3 — FLOW / ONE DAY ON SONGJEONG

**Purpose**
Make the user experience Songjeong as a living day. This section proves the location without listing location benefits.

**Visual**
Sequence of coastal lifestyle scenes:
- Morning sea
- Surfing / beach activity
- Promenade / couple walking
- Evening light / city glow

**Layout**
Keep the section pinned while time changes. Use time labels as the structure.

**Example labels**
```
06:12 / MORNING
13:40 / SURF
18:27 / WALK
21:05 / LIGHT
```

**Scroll Behavior**
One fixed section. As the user scrolls, the image changes like a film sequence. Use horizontal drift or editorial sliding, not ordinary vertical stacking.

The screen should feel like one day passing through a single coastal address.

**Copy Direction**
Short, observant, and atmospheric.

```
하루는 바다에서 시작되고,
빛은 건물의 표면에 남는다.
```

**Avoid**
- Making each time of day into separate repetitive sections
- Travel guide tone
- Overly happy lifestyle stock imagery
- "Nearby attractions" list

---

### Section 4 — WINDOW / OWN THE VIEW

**Purpose**
Create ownership desire. The key idea is not the room itself, but the view one can possess.

**Visual**
Large interior window / ocean view scene. The ocean view should feel like the essence of the address.

**Layout**

*Main image:*
- Full or near-full screen
- Calm, cinematic, warm

*Floating editorial frames:*
- 1 to 2 smaller images layered above the main image
- Sharp rectangular frames
- Tiny mono captions
- No shadows, no rounded cards

*Possible floating images:*
- Beach detail
- Facade crop
- Night building light
- Sea surface

**Example**
```
( 04 / THE WINDOW )

THE VIEW
IS NOT AN AMENITY

그것은 이 주소의 본질이다.
```

**Scroll Behavior**
The main image should remain almost still. The floating images shift slowly, as if the layout is being re-edited. The motion must be subtle.

**Avoid**
- Room catalog
- Bed close-up as luxury proof
- Amenity icons
- Floating cards with drop shadows

---

### Section 5 — SPACE / ROOMS & AMENITY

**Purpose**
Introduce rooms and amenities without becoming a normal hotel information page. This section may contain information, but it must remain design-led.

**Content Categories** (use only if content is available)
- ROOMS
- AMENITY
- POOL
- DINING
- FITNESS
- LOUNGE

**Structure**
Do not create a grid of facility cards. Use a more editorial transformation:

1. Sensory image
2. Short title and one-line description
3. Thin line / plan / number / detail

**Suggested interaction:**
- *First state:* left text, right image
- *Next scroll:* image crosses to the left, text moves right
- *Next state:* image recedes and thin data/plan lines appear

This creates a rhythm of:

> **feeling → structure → information**

**Example**
```
( 05 / SPACE )

ROOMS
ARE NOT THE STORY.
THE HORIZON IS.

공간은 조망을 위해 정리되고,
경험은 바다를 향해 열린다.
```

**Avoid**
- Room price table
- Amenity icon rows
- Rounded facility cards
- Booking module
- Too much practical copy

---

### Section 6 — EPILOGUE / ADDRESS

**Purpose**
End with memory, not conversion. The final impression should be the address itself.

**Visual**
Ivory or black editorial screen. Large type should dominate. Optional small architectural image or coastal crop.

**Layout**
Very sparse. Almost poster-like.

**Example**
```
( 06 / ADDRESS )

SONGJEONG
WILL REMEMBER
THIS ADDRESS

WYNDHAM / BUSAN / COASTAL LANDMARK
```

**CTA**
Only a small text link if necessary:

```
CONTACT →
```

Keep it secondary. Do not make it a big button.

**Avoid**
- Final sales pitch
- Big inquiry form
- "Reserve now" section
- Promotional banner

---

## Copywriting Rules

The copy must be **short, confident, and structural**.

**Use:**
- Declarative phrases
- Bilingual English/Korean hierarchy
- English display copy
- Korean emotional support copy
- Mono section labels

**Avoid:**
- "최고의 경험을 제공합니다"
- "차별화된 프리미엄"
- "당신을 위한 특별한 공간"
- "새로운 라이프스타일"
- "품격 있는 휴식"
- Generic hospitality cliches

The tone is not friendly sales. The tone is **quiet certainty**.

---

## Layout Rules

Use asymmetry. Never repeat the same left-text / right-image pattern twice in a row.

**Recommended layout patterns:**
- Full-bleed visual with small offset text
- Split composition with unequal columns
- Pinned section with changing image states
- Horizontal drift inside a vertical scroll journey
- Editorial floating image overlays
- Giant type with small image evidence
- Thin line indexes and page numbers

**Avoid:**
- Equal 50/50 split repeated across sections
- Centered hero repeated
- Card grids
- Icon feature rows
- Timeline templates
- Bento grid unless extremely restrained

---

## Scroll System

Use magnetic scroll snapping for major sections. However, not every section should behave identically.

**Required rhythm:**

| Section | Behavior |
|---------|----------|
| Coast | Discovery reveal |
| Landmark | Vertical rise |
| Flow | Pinned time sequence |
| Window | Still main image with floating editorial overlays |
| Space | Image/text crossing transformation |
| Address | Quiet poster-like stop |

The site should feel like one continuous designed journey. It should not feel like a slideshow.

---

## Interaction Details

**Hover:**
- Text links: hairline underline
- Image frames: inner image scale max `1.02`
- Buttons/links: invert black/ivory only if needed

**Do not use:**
- Glow hover
- Shadow lift
- Scale-down press animation
- Opacity-only lazy hover

**Touch:**
- Ensure mobile interactions do not depend on hover
- Keep tap targets usable

**Accessibility:**
- Provide reduced-motion fallback
- Maintain readable contrast
- Do not trap the user in scroll sections
- Allow normal scrolling on mobile if snap becomes uncomfortable

---

## Mobile Direction

Mobile should not be a broken desktop crop.

**For mobile:**
- Keep full-screen section rhythm where possible
- Reduce oversized type carefully
- Keep labels and pagination visible but small
- Avoid tiny floating images that become meaningless
- Convert horizontal drift into stacked editorial reveals if needed
- Make scroll snap softer or optional

Mobile must still feel premium, not like a simplified afterthought.

---

## What Must Not Happen

The final design must **not** look like:

- A hotel template
- A resort booking website
- A Korean 분양 홍보 landing page
- A generic luxury brochure
- A SaaS landing page
- A card-based facility catalog
- A fullscreen slideshow with text pasted on top
- An AI-generated "premium" mockup with predictable gradients and rounded cards

---

## Final Evaluation Checklist

Before considering the design complete, check:

- [ ] Does the first screen feel memorable before it explains anything?
- [ ] Does each section have a distinct scroll behavior?
- [ ] Does the site avoid a separate CTA section?
- [ ] Does the design feel more like a portfolio piece than a sales page?
- [ ] Is the hotel presented as an address and landmark, not just a place to sleep?
- [ ] Is the copy short enough?
- [ ] Are the images used as mood and evidence, not decoration?
- [ ] Are there no generic cards, icon rows, or template hotel patterns?
- [ ] Does the final section leave an impression rather than a sales pitch?
- [ ] Would this be strong enough to show as one of the best hotel websites in Korea?

---

## One-Line Creative Direction

> Create a magnetic-scroll editorial hotel website where Busan Songjeong's coastline, vertical landmark architecture, daily beach rhythm, and private ocean view unfold as one restrained, luxurious journey without relying on booking CTAs or generic hotel sections.
