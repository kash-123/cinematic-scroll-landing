# Full-Page Book Mode

The whole page is one book; scrolling turns its pages. Distilled from the
Codex Academy build (LMS trial page) — shipped, verified, and corrected
against the live deployment.

## The paper model

A book open at spread k shows left page L_k and right page R_k. Turning
the right page rotates a **sheet**: front face = R_k, back face = L_(k+1).
For S spreads you need: 1 cover board (front = cover art, back = L1),
S−1 sheets, 1 base page (R_S, e.g. inside-back-cover CTA). 2S folio pages.

```
z during flip of sheet k:          DOM (reading order, z via styles):
        ┌── flipping sheet k        .cover   (front: cover, back: L1)
        │   (z = 7+k, topmost)      .sheet×5 (front: R_k, back: L_(k+1))
   L ◄──┘   ► R                     .base    (R_6)
 [flipped   [unflipped
  7+1..7+k−1] 7−(k+1).., base 0]
```

## Geometry (CSS)

```css
.book-stage { position: sticky; top: 0; height: 100vh; display: grid; place-items: center; }
.book-persp { position: absolute; inset: 0; display: grid; place-items: center; perspective: 1600px; }
.book  { position: relative; transform-style: preserve-3d;
         width: min(86vw, 1180px, calc((100vh - 96px) * 1.48)); aspect-ratio: 2 / 1.35; }
.leaf  { position: absolute; top: 0; right: 0; width: 50%; height: 100%;
         transform-style: preserve-3d; transform-origin: left center; }
.face  { position: absolute; inset: 0; backface-visibility: hidden; overflow: hidden; }
.face.back { transform: rotateY(180deg); }
```

Sticky beats ScrollTrigger `pin` here: no pin-spacer math, plays perfectly
with Lenis; ScrollTrigger only scrubs the timeline
(`trigger: runway, start: 'top top', end: 'bottom bottom', scrub: 1`),
runway height = `totalUnits × 110vh`.

## Z-index choreography (the crux)

Static z-order cannot work: sheet k+1 must pass ABOVE already-flipped
sheet k mid-turn despite starting below it in the right stack.

- Unflipped sheet k: `z = N − k` (N = sheets + 2).
- At flip start: `tl.set(sheet, { zIndex: N + k })` — it now beats every
  flipped sheet (N+1..N+k−1) and every unflipped one; left stack ends
  latest-on-top.
- Cover: z = 20 while closed/opening (above all unflipped), set to 1 right
  after open completes (below all future-flipped sheets).

Because z is managed, sheets rest at **−178° + k·0.4°** (readable 2°
keystone; per-sheet stagger prevents coplanar flicker — or use ~0.5px
translateZ "paper thickness" per sheet). The −168° trick is only needed
when z is NOT choreographed. Cover opens to −179°.

## Timeline math

Units: cover 1.0 + settle 0.15, per sheet flip 1.0 + settle 0.15, final
emphasis 0.4. Keep it in a pure module and unit-test it:
`sheetFlipStart(k) = 1.15 + (k−1)·1.15`; TOC target for spread k =
`1.15·k` units; scroll px = `runwayTop + (units/total)·(runwayH − 100vh)`.

Cover open recentres the block: closed book is one page wide, open is two
— animate `xPercent: −25 → 0` on `.book` in the same tween as the cover
rotation.

## Per-flip recipe

```ts
const at = sheetFlipStart(k);
tl.set(sheet, { zIndex: zFlipped(k) }, at);
tl.to(sheet, { rotationY: restAngle(k), duration: 1, ease: 'power2.inOut' }, at);
tl.to(shade,  { opacity: 0.5, duration: 0.5, ease: 'power1.in'  }, at);        // gradient div on sheet
tl.to(shade,  { opacity: 0,   duration: 0.5, ease: 'power1.out' }, at + 0.5);
tl.to(nextDevelop, { opacity: 0, duration: 0.4 }, at + 0.3);                    // black overlay 0.45→0 on the
                                                                                // NEXT right page — cheaper than
                                                                                // filter: brightness, same read
```

## Corrections that cost real debugging (from the shipped build)

- **The first right page is revealed by the COVER, not by a flip.** If you
  pre-set a "develop" overlay on every sheet front, nothing ever clears
  R1's — clear it during the cover-open segment or the TOC sits dim forever.
- **Retire the ribbon bookmark before the final spread** (fade it out during
  the last emphasis) and keep it near the page margin (~8% from the edge):
  fully grown it otherwise strikes through the CTA.
- **A stopped Lenis silently ignores `scrollTo`.** Preloaders stop Lenis, so
  hash-deep-link jumps at mount are no-ops without
  `lenis.scrollTo(y, { immediate: true, force: true })`.
- **Expose the smoother for verification**: `window.__lenis = lenis` lets a
  puppeteer harness set exact scroll depths (`scrollTo(y, {immediate, force})`)
  for deterministic screenshots at chosen timeline units.
- Mid-flip, the turning sheet at ~90° shows a 1-2px smeared content sliver at
  the spine. It reads as a turning page in motion — leave it.

## Book grammar

Folio `PAGE 2k−1 — 2k / 2S` (HUD, guarded setState from
`onUpdate: currentSpread(progress × total)`); running chapter head; gold
ribbon bookmark `scaleY 0→1, ease: none` across the whole timeline;
page-edge strips on the right that `scaleX → 0`; spine groove fades in as
the cover clears (~0.9 units).

## Flat fallback (mobile + prefers-reduced-motion)

Same DOM, zero JS motion. The killer trick: `.book-flat .leaf
{ display: contents; }` makes all faces flex items of `.book`; give every
face `--folio: <2k or 2k+1>` and `.book-flat .face { order: var(--folio); }`
→ perfect reading order. Hide shade/develop/edges/ribbon/spine; faces
`position: static`. TOC links are real `#hash` anchors (native in flat
mode, `preventDefault` + `scrollTo` in book mode). Gate ALL motion behind
`gsap.matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)')`.

## Gotchas

- Backface + preserve-3d needs `-webkit-backface-visibility` for older
  Safari.
- StrictMode double-mounts effects: build everything inside
  `gsap.matchMedia()` and `mm.revert()` in cleanup or you get twin
  timelines.
- Content must fit the page: author copy for 1280×720; `clamp()` type;
  never inner-scroll a page.
- The base page and resting cover-back share z=0/1 but never overlap
  (left vs right halves) — do not "fix" that into a z-fight.
