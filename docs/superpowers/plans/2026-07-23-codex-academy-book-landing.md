# Codex Academy Full-Book Landing + Skill Enhancement — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the `cinematic-scroll-landing` skill, build "The Codex Academy" — a Moodle-LMS trial landing page where the entire page is a book whose pages turn as you scroll — deploy it to Vercel, back-port learnings, and install the skill.

**Architecture:** One 100vh sticky stage inside a ~8-viewport scroll runway; a single scrubbed GSAP timeline turns CSS-3D sheets (front face = right page k, back face = left page k+1) around the spine with choreographed z-indexes. Pure timeline math lives in `lib/bookTimeline.ts` (unit-tested); all copy/images in `data/content.ts`. Mobile + reduced-motion reflow the same DOM into stacked sections via CSS (`display: contents` on leaves + flex `order`).

**Tech Stack:** React 19, Vite 7, TypeScript, Tailwind v4 (`@tailwindcss/vite`), GSAP 3 ScrollTrigger, Lenis, @fontsource (Cormorant Garamond + IBM Plex Mono), Vitest.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-23-codex-academy-book-landing-design.md` — it governs on any conflict.
- Palette (exact): obsidian `#0B0E13`, parchment `#14181F`, ink `#E8E3D8`, gold `#C9A45C`, gold-dim `rgba(201,164,92,.35)`.
- Brand strings (exact): "THE CODEX ACADEMY", tagline "Learning, bound beautifully.", CTA "Begin your trial", credit "Powered by Moodle™".
- 6 spreads = 12 folio pages = cover board + 5 sheets + base page. Timeline total = 7.3 units. Runway = `totalUnits() × 110vh` ≈ 8 viewports.
- Sheets rest at −178°+k·0.4°; z is choreographed (`zStacked(k)=7−k` → `zFlipped(k)=7+k` at flip start); cover z 20 → 1 after open; cover opens to −179° while book translates `xPercent −25 → 0`.
- No infinite scroll. No router. No forms/data collection. All names/stats fictional and demo-labeled. No flashing > 3/sec.
- Perf: no blur filters on page-sized layers (opacity overlays instead); `will-change` scoped; JS bundle < 250KB gzip; pages must fit 1280×720 without inner scroll (cut copy if not).
- Vite `base: '/'`. Fonts self-hosted only (no CDN).
- All site code in `demo/`. All shell commands for the site run from `demo/`. Commit after every task (repo root), messages end with:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- Skill-file changes (Tasks 1–2, 13) keep the lean, imperative voice of the existing SKILL.md.

---

### Task 1: Rewrite SKILL.md (menu framing, trade-offs, trimmed gotchas)

**Files:**
- Modify: `SKILL.md` (full replacement below)

**Interfaces:**
- Produces: SKILL.md that references `references/book-mode.md` (created in Task 2).

- [ ] **Step 1: Replace SKILL.md with exactly this content**

````markdown
---
name: cinematic-scroll-landing
description: >
  Build dark, cinematic, awwwards-style landing pages with seamless scroll
  choreography — endless/infinite scroll loops, pinned image-morph galleries,
  book page-flip feature sections, full-page book sites, cross-dissolve scene
  transitions, unified AI-generated imagery, film-slate section markers. Use
  when the user asks for an "endless scroll", "infinite scroll", "seamless
  scroll", "cinematic", "movie-like", "page-flip", "flipbook", "book landing
  page", "book-style scroll", "morphing images" landing page, or references
  sites like activetheory.net, or complains that an existing scroll experience
  feels disjointed ("sections don't flow", "images feel unrelated").
  Stack: React 19 + Vite + Tailwind + GSAP ScrollTrigger + Lenis.
---

# Cinematic Scroll Landing Pages

Methodology distilled from production builds (agency-grade studio site
rebranded into an institutional LMS landing; a full-page book site for an
LMS trial). It produces sites that feel like one continuous film, not a
stack of sections.

## The core system (always applies)

1. **Research the reference, don't clone the stack.** Award sites are
   usually custom WebGL engines. Decompose the *feel* into reproducible
   mechanics: smooth scroll, parallax, distortion, looping. You get 90% of
   the feel with Lenis + GSAP + disciplined art direction.

2. **One visual universe.** The #1 cause of "sections feel unrelated" is
   mixed-source imagery. Generate ALL imagery with ONE locked style template
   (see `references/imagery-universe.md`). Never mix stock photos with
   generated art. QA every batch on a contact sheet; crop generator
   watermarks (bottom ~5.5% is typical).

3. **A shared atmosphere layer.** One `position: fixed` layer behind all
   content (radial gradient + slow-drifting fog/noise + faint watermark),
   mounted ONCE at layout level — never per-section. Content floats
   *through* one continuous world.

4. **One transition grammar.** Pick ONE reveal recipe and ONE dissolve
   recipe and use them site-wide (e.g. clip-path `inset(12%)→0` +
   scale `1.2→1`; cross-dissolves with ~25vh overlap). Matched parallax on
   ALL media. Consistency, not variety, is what reads as cinematic.

5. **Film grammar.** Section labels as slates (`SC.01 / HERO`), mono folios,
   accent progress ticks, preloader with 000→100 counter, film grain.
   For book-themed sites this becomes book grammar: folios, running heads,
   ribbon bookmark, colophon.

## Set-piece menu (choose deliberately — each has costs)

| Set-piece | Use when | Do NOT use when | Cost |
|---|---|---|---|
| Endless loop (Lenis `infinite: true`) | Portfolio/brand reels meant for wandering | Conversion pages — they must END on a CTA; content users need to re-find | Kills scrollbar/footer wayfinding; disorienting |
| Image-morph gallery (pinned) | Showcasing N related works/products | Text-heavy content | ~N×100vh scroll runway |
| Flip-book section (pinned) | A chaptered feature story inside a longer page | Only 1–2 items to show | ~pages×100vh runway |
| Full-page book (`references/book-mode.md`) | The whole page IS the story; trial/launch pages wanting max wow | Docs-like or frequently-revisited utility pages | Whole page pinned; content must fit page spreads; mobile needs a flat fallback |
| Cross-dissolve scenes | Any multi-section cinematic page | — | Cheap; default choice |

**Costs & trade-offs (read before choosing):** infinite scroll destroys the
scrollbar and footer as navigation; every pinned scene adds scroll runway
the user must budget (report total "lap length"; keep home ≤ ~25
viewports); stacked blurred layers and unscoped `will-change` melt GPUs —
prefer opacity overlays over animated `filter`; pinned scenes need
keyboard/AT escape paths. Skipping imagery unity (core #2) or the
atmosphere layer (core #3) is what makes sections feel unrelated — those
two are not optional.

## Workflow

1. **Teardown** (if a reference URL is given): fetch HTML + screenshots +
   web research; identify engine, type, palette, motion vocabulary. Write
   findings to `info.md`. Conclusion is almost always "custom WebGL —
   imitate the mechanics, not the stack".
2. **Design doc first** (palette ≤3 colors + accent, type pairing,
   hairlines), then implement. Pick set-pieces from the menu ON PURPOSE.
3. **Budget scroll length**: each pinned scene costs viewports. Tell the
   user the total.
4. **Verify visually** (NON-NEGOTIABLE): serve the build, screenshot at
   multiple scroll depths — hero, each set-piece mid-state, transitions,
   ending. Static builds of cinematic sites ALWAYS have at least one bug
   you can't see in code.
5. **Deep-link test**: hard-load nested routes and hash anchors.
6. **Deploy, then verify the LIVE URL** the same way (see checklist).

## Gotchas (each cost real time — check them all)

- **Vite `base: './'` breaks deep links.** Relative asset URLs 404 the JS
  bundle on hard-load of nested routes → blank page. Use `base: '/'` (or
  the deployment subpath, e.g. `/repo-name/` for GitHub Pages).
- **Pinned sections + loops**: pins live INSIDE loop content;
  atmosphere/HUD are global. Outros go inside the pin timeline's tail.
- **GSAP `filter` clobbers Tailwind filter classes**: animate filters on a
  wrapper div, never on the same element as Tailwind filter utilities —
  better, avoid animated filters entirely (opacity overlays composite
  cheaper).
- **Generated images ship watermarks**: contact-sheet every batch, crop
  bottom ~5.5%.
- **"Missing images" is often logical, not 404s**: audit data-level wiring
  (per-item image fields), not just file existence
  (`scripts/audit_images.py`).
- **Mobile + reduced-motion**: unpin everything; stacked fades. Gate with
  `gsap.matchMedia`. No strobing (WCAG 2.3.1: any flash < 3/sec); pinned
  scenes must not trap keyboard focus; preloaders resolve instantly under
  reduced-motion and always carry a failsafe timeout.
- **External credentials**: probe capabilities before use (list what the
  token can actually do before depending on it).
- **Unreliable filesystems**: if your environment's FS is flaky, verify
  every git ref update immediately after making it.

## Bundled resources

- `references/motion-recipes.md` — copy-paste GSAP/Lenis code: Lenis
  infinite loop, morph gallery, flip-book section, cross-dissolves,
  velocity marquee, preloader.
- `references/book-mode.md` — full-page book sites: sheet model, z-index
  choreography, timeline math, flat fallback.
- `references/imagery-universe.md` — locked style template, per-item
  prompts, contact-sheet QA + watermark crop.
- `scripts/audit_images.py` — image refs vs `public/` (missing + unused +
  shared-generic wiring smells).

## Delivery checklist

- [ ] `npm run build` passes
- [ ] Screenshots at ≥5 scroll depths reviewed (local)
- [ ] Deep link / hash-anchor hard-loads render (not blank)
- [ ] All imagery passes contact-sheet review (one universe, no watermarks)
- [ ] Reduced-motion + mobile fallbacks render ALL content
- [ ] Scroll-length budget reported to user
- [ ] og/meta/favicon present
- [ ] Deployed URL smoke-tested: re-screenshot hero, one mid-set-piece,
      ending; hash deep-link hard-load
- [ ] Quick Lighthouse pass (perf + a11y sanity)
- [ ] Demo copy contains no real institutions/people; credits are
      nominative only
````

- [ ] **Step 2: Verify line budget**

Run: `wc -l SKILL.md` — Expected: ≤ 175 lines (lean rule).

- [ ] **Step 3: Commit**

```bash
git add SKILL.md && git commit -m "Skill: reframe pillars as core system + set-piece menu with costs

Adds full-page-book to triggers and menu, honest trade-offs, generalizes
env-specific gotchas, extends delivery checklist with deploy smoke tests.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Draft references/book-mode.md + touch up other references

**Files:**
- Create: `references/book-mode.md`
- Modify: `references/motion-recipes.md` (append pointer)
- Modify: `references/imagery-universe.md` (append tool note)

**Interfaces:**
- Produces: the recipe Task 8 implements; Task 13 corrects it from build reality.

- [ ] **Step 1: Create `references/book-mode.md` with exactly this content**

````markdown
# Full-Page Book Mode

The whole page is one book; scrolling turns its pages. Distilled from the
Codex Academy build (LMS trial page). DRAFT status until back-ported from
a shipped build.

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
````

- [ ] **Step 2: Append to `references/motion-recipes.md`**

```markdown

## 7. Full-page book mode

The whole page as one book (cover open → sheet flips → CTA base page)
outgrew this file: see `references/book-mode.md` for the sheet model,
z-index choreography, timeline math, and the flat mobile fallback.
```

- [ ] **Step 3: Append to `references/imagery-universe.md`**

```markdown

## Tooling note

The template is tool-agnostic: use whatever image-generation skill/tool
the session provides (e.g. a Gemini/banana skill). The locked template,
contact-sheet QA, and watermark crop apply identically regardless of tool.
```

- [ ] **Step 4: Commit**

```bash
git add references && git commit -m "Skill: add full-page book-mode recipe (draft), reference touch-ups

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Scaffold demo/ (Vite + deps + config + tokens/textures CSS)

**Files:**
- Create: `demo/` via Vite scaffold, then `demo/vite.config.ts`, `demo/index.html`, `demo/public/favicon.svg`, `demo/src/styles/global.css`, `demo/src/main.tsx`; delete scaffold cruft (`demo/src/App.css`, `demo/src/index.css`, `demo/src/assets/react.svg`, `demo/public/vite.svg`).

**Interfaces:**
- Produces: buildable empty app; CSS classes `.leather .paper .foil .mono .font-display .page-pad .grain` + geometry classes consumed by Tasks 6–9.

- [ ] **Step 1: Scaffold and install (env check included)**

```bash
node --version && npm --version   # expect node ≥ 20
npm create vite@latest demo -- --template react-ts
cd demo
npm install
npm install gsap lenis @fontsource/cormorant-garamond @fontsource/ibm-plex-mono
npm install -D tailwindcss @tailwindcss/vite vitest
```

- [ ] **Step 2: Write `demo/vite.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
```

- [ ] **Step 3: Write `demo/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>The Codex Academy — Learning, bound beautifully</title>
    <meta name="description" content="A Moodle-powered learning platform, presented as a book you scroll through. Fictional demo: courses, assessments, gradebook, live halls — thirty-day trial." />
    <meta property="og:title" content="The Codex Academy" />
    <meta property="og:description" content="Learning, bound beautifully. A Moodle-powered LMS trial, presented as a book you read by scrolling." />
    <meta property="og:image" content="/og/cover-og.png" />
    <meta property="og:type" content="website" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Write `demo/public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#0B0E13"/>
  <path d="M16 8c-2.5-1.6-5.5-2-9-2v18c3.5 0 6.5.4 9 2 2.5-1.6 5.5-2 9-2V6c-3.5 0-6.5.4-9 2z" fill="none" stroke="#C9A45C" stroke-width="1.6"/>
  <path d="M16 8v18" stroke="#C9A45C" stroke-width="1.2"/>
</svg>
```

- [ ] **Step 5: Write `demo/src/styles/global.css`**

```css
@import 'tailwindcss';

@theme {
  --color-obsidian: #0b0e13;
  --color-parchment: #14181f;
  --color-ink: #e8e3d8;
  --color-gold: #c9a45c;
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-hud: 'IBM Plex Mono', ui-monospace, monospace;
}

:root { color-scheme: dark; }
html, body { background: var(--color-obsidian); color: var(--color-ink); }
body { font-family: var(--font-display); overflow-x: hidden; }

.font-display { font-family: var(--font-display); }
.mono { font-family: var(--font-hud); }
.foil {
  background: linear-gradient(115deg, #8a6d35 0%, #c9a45c 35%, #f0dfae 50%, #c9a45c 65%, #8a6d35 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}

/* ---- procedural materials ---- */
.leather {
  position: relative;
  background: radial-gradient(120% 90% at 30% 20%, #171b23 0%, #0b0e13 60%, #07090d 100%);
  box-shadow: inset 0 0 0 1px rgb(201 164 92 / 0.28), inset 0 0 90px rgb(0 0 0 / 0.8);
}
.leather::before {
  content: ''; position: absolute; inset: 10px;
  border: 1px solid rgb(201 164 92 / 0.35); pointer-events: none;
}
.paper {
  position: relative;
  background: linear-gradient(105deg, #10141b 0%, #151a22 8%, #14181f 50%, #12161d 92%, #0e1118 100%);
  box-shadow: inset 0 0 60px rgb(0 0 0 / 0.55);
}
.noise::after, .grain {
  position: absolute; inset: 0; pointer-events: none; content: '';
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>");
  opacity: 0.05; mix-blend-mode: overlay;
}
.grain { position: fixed; z-index: 60; opacity: 0.04; }

/* ---- book geometry ---- */
.runway { position: relative; }
.book-stage { position: sticky; top: 0; height: 100vh; display: grid; place-items: center; }
.book-persp { position: absolute; inset: 0; display: grid; place-items: center; perspective: 1600px; }
.book {
  position: relative; transform-style: preserve-3d;
  width: min(86vw, 1180px, calc((100vh - 96px) * 1.48));
  aspect-ratio: 2 / 1.35;
}
.leaf {
  position: absolute; top: 0; right: 0; width: 50%; height: 100%;
  transform-style: preserve-3d; transform-origin: left center;
}
.face {
  position: absolute; inset: 0; overflow: hidden;
  backface-visibility: hidden; -webkit-backface-visibility: hidden;
}
.face.back { transform: rotateY(180deg); }
.page-pad {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  padding: clamp(1.6rem, 3vw, 3rem); overflow: hidden;
}
.sheet-shade {
  position: absolute; inset: 0; pointer-events: none; opacity: 0;
  background: linear-gradient(to right, rgb(0 0 0 / 0.45), transparent 60%);
}
.develop { position: absolute; inset: 0; pointer-events: none; opacity: 0; background: #000; }
.spine {
  position: absolute; top: 0; bottom: 0; left: 50%; width: 4px; margin-left: -2px;
  opacity: 0; pointer-events: none;
  background: linear-gradient(180deg, transparent, rgb(0 0 0 / 0.6) 10% 90%, transparent);
  box-shadow: 0 0 0 0.5px rgb(201 164 92 / 0.35);
}
.page-edges {
  position: absolute; top: 1.5%; bottom: 1.5%; right: -6px; width: 6px;
  pointer-events: none; transform-origin: right;
  background: repeating-linear-gradient(to right, #1b202a 0 1px, #0e1116 1px 2px);
}
.ribbon {
  position: absolute; top: -1.5%; right: 14%; width: 24px; height: 56%;
  z-index: 40; pointer-events: none; transform: scaleY(0); transform-origin: top;
  background: linear-gradient(180deg, #8a6d35, #c9a45c 40%, #8a6d35);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 92%, 0 100%);
  box-shadow: 2px 4px 8px rgb(0 0 0 / 0.5);
}
.cta-glint {
  position: absolute; inset: 0; pointer-events: none; opacity: 0;
  box-shadow: inset 0 0 60px rgb(201 164 92 / 0.14);
}

/* ---- HUD ---- */
.hud-head, .hud-folio {
  position: fixed; left: 0; right: 0; text-align: center; z-index: 50;
  font-family: var(--font-hud); font-size: 0.7rem; letter-spacing: 0.3em;
  text-transform: uppercase; pointer-events: none; transition: opacity 0.4s;
}
.hud-head { top: 1.1rem; color: rgb(232 227 216 / 0.6); }
.hud-folio { bottom: 1.1rem; color: rgb(201 164 92 / 0.75); }

/* ---- preloader ---- */
.preloader { position: fixed; inset: 0; z-index: 70; }
.wipe { position: absolute; top: 0; bottom: 0; width: 50.5%; background: #07090d; }
.wipe:first-child { left: 0; } .wipe + .wipe { right: 0; }
.preloader-center {
  position: absolute; inset: 0; display: grid; place-content: center;
  gap: 0.75rem; text-align: center;
}

/* ---- atmosphere ---- */
.atm { position: fixed; inset: 0; z-index: -1; overflow: hidden; background: var(--color-obsidian); }
.atm-glow {
  position: absolute; inset: -20%;
  background: radial-gradient(50% 40% at 50% 30%, rgb(201 164 92 / 0.07), transparent 70%);
}
.atm-blob {
  position: absolute; width: 55vw; height: 55vw; border-radius: 50%;
  filter: blur(90px); opacity: 0.5; animation: drift 46s ease-in-out infinite alternate;
}
.atm-blob.a { background: rgb(20 26 38 / 0.8); top: -12%; left: -10%; }
.atm-blob.b { background: rgb(28 24 16 / 0.55); bottom: -18%; right: -8%; animation-duration: 58s; animation-delay: -20s; }
@keyframes drift {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to { transform: translate3d(9vw, 6vh, 0) scale(1.15); }
}

/* ---- flat fallback (mobile + reduced motion) ---- */
@media (prefers-reduced-motion: reduce) {
  .atm-blob { animation: none; }
}
.book-flat .runway { height: auto !important; }
.book-flat .book-stage { position: static; height: auto; display: block; }
.book-flat .book-persp { position: static; perspective: none; display: block; }
.book-flat .book { width: 100%; aspect-ratio: auto; transform: none !important; display: flex; flex-direction: column; }
.book-flat .leaf { display: contents; }
.book-flat .face {
  position: static; transform: none !important; order: var(--folio, 0);
  min-height: 60vh; backface-visibility: visible; -webkit-backface-visibility: visible;
}
.book-flat .page-pad { position: static; min-height: 60vh; }
.book-flat .sheet-shade, .book-flat .develop, .book-flat .page-edges,
.book-flat .ribbon, .book-flat .spine, .book-flat .cta-glint { display: none; }
```

- [ ] **Step 6: Write `demo/src/main.tsx`; empty `App` placeholder**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/600.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import './styles/global.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

Replace `demo/src/App.tsx` with:

```tsx
export default function App() {
  return <main className="min-h-screen" />
}
```

Delete `demo/src/App.css`, `demo/src/index.css`, `demo/src/assets/react.svg`, `demo/public/vite.svg`.

- [ ] **Step 7: Verify build**

Run (in `demo/`): `npm run build` — Expected: `✓ built` with no TS errors.

- [ ] **Step 8: Commit**

```bash
git add demo && git commit -m "demo: scaffold Vite+React+Tailwind app with tokens, materials, book geometry CSS

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: content.ts (all copy + image manifest) — test first

**Files:**
- Create: `demo/src/data/content.ts`
- Test: `demo/src/data/content.test.ts`

**Interfaces:**
- Produces (consumed by Tasks 6, 8, 10): `BRAND`, `TAGLINE`, `COVER_HINT`, `TOC: TocEntry[]` (`{ num, title, sub, hash, spread }`), `CHAPTER_HEADS: string[]` (index = spread 0..6), `FEATURES_A/B: Feature[]`, `COURSES: Course[]`, `STATS: Stat[]`, `TESTIMONIAL`, `TRIAL`, `IMAGES: Img[]` (`{ id, src, alt }`).

- [ ] **Step 1: Write the failing test `demo/src/data/content.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { CHAPTER_HEADS, COURSES, FEATURES_A, FEATURES_B, IMAGES, STATS, TOC } from './content'

describe('content integrity', () => {
  it('has 4 TOC chapters targeting spreads 2,4,5,6 with ch-N hashes', () => {
    expect(TOC.map(t => t.spread)).toEqual([2, 4, 5, 6])
    expect(TOC.map(t => t.hash)).toEqual(['ch-1', 'ch-2', 'ch-3', 'ch-4'])
  })
  it('has chapter heads for spreads 0..6', () => {
    expect(CHAPTER_HEADS).toHaveLength(7)
  })
  it('has 3+3 features, 4 courses, 3 stats', () => {
    expect(FEATURES_A).toHaveLength(3)
    expect(FEATURES_B).toHaveLength(3)
    expect(COURSES).toHaveLength(4)
    expect(STATS).toHaveLength(3)
  })
  it('has 10 uniquely-named png images under /images or /og', () => {
    expect(IMAGES).toHaveLength(10)
    expect(new Set(IMAGES.map(i => i.id)).size).toBe(10)
    for (const img of IMAGES) expect(img.src).toMatch(/^\/(images|og)\/[a-z-]+\.png$/)
  })
  it('every course card image exists in the manifest', () => {
    const srcs = new Set(IMAGES.map(i => i.src))
    for (const c of COURSES) expect(srcs.has(c.image)).toBe(true)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run (in `demo/`): `npx vitest run src/data/content.test.ts`
Expected: FAIL — cannot resolve `./content`.

- [ ] **Step 3: Write `demo/src/data/content.ts`**

```ts
export const BRAND = 'THE CODEX ACADEMY'
export const TAGLINE = 'Learning, bound beautifully.'
export const COVER_HINT = 'Scroll to open'

export interface TocEntry { num: string; title: string; sub: string; hash: string; spread: number }
export const TOC: TocEntry[] = [
  { num: 'I', title: 'The Craft', sub: 'Tools of the teaching trade', hash: 'ch-1', spread: 2 },
  { num: 'II', title: 'The Catalog', sub: 'Courses, bound in gold', hash: 'ch-2', spread: 4 },
  { num: 'III', title: 'The Record', sub: 'Outcomes worth inscribing', hash: 'ch-3', spread: 5 },
  { num: 'IV', title: 'Begin', sub: 'Your first thirty days', hash: 'ch-4', spread: 6 },
]

// index = current spread (0 = cover)
export const CHAPTER_HEADS = ['', 'Contents', 'Chapter I — The Craft', 'Chapter I — The Craft', 'Chapter II — The Catalog', 'Chapter III — The Record', 'Chapter IV — Begin']

export interface Feature { title: string; body: string }
export const FEATURES_A: Feature[] = [
  { title: 'Course Builder', body: 'Drag chapters, lessons, and media into courses that read like a well-kept book — structured, ordered, findable.' },
  { title: 'Assessments', body: 'Quizzes, assignments, and rubrics with instant feedback. Every attempt recorded neatly in the margin.' },
  { title: 'Gradebook', body: 'A living ledger: weighted grades, custom scales, and exports your registrar will actually accept.' },
]
export const FEATURES_B: Feature[] = [
  { title: 'Forums & Live Halls', body: 'Threaded discussion beside every lesson, and BigBlueButton lecture halls one click away.' },
  { title: 'In Every Pocket', body: 'The full academy on iOS and Android. Offline lessons sync the moment learners resurface.' },
  { title: 'Seals & Certificates', body: 'Badges and completion certificates issued automatically — verifiable by anyone you choose.' },
]

export interface Course { id: string; title: string; lessons: number; image: string; alt: string }
export const COURSES: Course[] = [
  { id: 'astronomy', title: 'Astronomy & Navigation', lessons: 12, image: '/images/catalog-astrolabe.png', alt: 'Brass astrolabe rim-lit in gold against a dark background' },
  { id: 'mathematics', title: 'Mathematics & Logic', lessons: 16, image: '/images/catalog-compass.png', alt: 'Gold drafting compass standing on dark parchment' },
  { id: 'sciences', title: 'Natural Sciences', lessons: 14, image: '/images/catalog-botany.png', alt: 'Botanical specimen preserved under a glass dome, gold rim light' },
  { id: 'humanities', title: 'Rhetoric & Humanities', lessons: 11, image: '/images/catalog-lyre.png', alt: 'Gold lyre emerging from darkness with volumetric fog' },
]

export interface Stat { value: string; label: string }
export const STATS: Stat[] = [
  { value: '12,000+', label: 'learners bound' },
  { value: '48', label: 'institutions' },
  { value: '94%', label: 'completion rate' },
]
export const STATS_NOTE = 'Figures illustrative — demo edition.'

export const TESTIMONIAL = {
  quote: 'We moved three faculties into the Codex in one term. Our students stopped asking where things were — everything reads in order, like it should.',
  name: 'Prof. A. Whitmore',
  role: 'Dean of Studies, Hartwell College (fictional)',
}

export const TRIAL = {
  heading: 'Thirty days, the whole library.',
  points: ['Every feature unlocked', 'Up to 500 learners', 'No card required', 'Import your existing Moodle courses'],
  credit: 'Set in Cormorant. Powered by Moodle™ — the open-source LMS. This is a fictional demonstration; no data is collected.',
  cta: 'Begin your trial',
  ctaSub: 'The first page is already turned.',
}

export interface Img { id: string; src: string; alt: string }
export const IMAGES: Img[] = [
  { id: 'frontispiece-emblem', src: '/images/frontispiece-emblem.png', alt: 'Gold emblem plate: an open tome encircled by a laurel wreath' },
  { id: 'craft-inkwell', src: '/images/craft-inkwell.png', alt: 'Quill and brass inkwell, single gold rim light' },
  { id: 'craft-seal', src: '/images/craft-seal.png', alt: 'Wax seal stamp resting on dark documents' },
  { id: 'catalog-astrolabe', src: '/images/catalog-astrolabe.png', alt: 'Brass astrolabe rim-lit in gold against a dark background' },
  { id: 'catalog-compass', src: '/images/catalog-compass.png', alt: 'Gold drafting compass standing on dark parchment' },
  { id: 'catalog-botany', src: '/images/catalog-botany.png', alt: 'Botanical specimen preserved under a glass dome, gold rim light' },
  { id: 'catalog-lyre', src: '/images/catalog-lyre.png', alt: 'Gold lyre emerging from darkness with volumetric fog' },
  { id: 'record-armillary', src: '/images/record-armillary.png', alt: 'Armillary sphere in obsidian and gold, volumetric fog' },
  { id: 'colophon-candle', src: '/images/colophon-candle.png', alt: 'Lit candle beside a stack of dark leather tomes' },
  { id: 'cover-og', src: '/og/cover-og.png', alt: 'Closed obsidian book with gold foil lettering, three-quarter view' },
]
export const imageById = (id: string): Img => {
  const img = IMAGES.find(i => i.id === id)
  if (!img) throw new Error(`unknown image id: ${id}`)
  return img
}
```

- [ ] **Step 4: Run test to verify pass**

Run (in `demo/`): `npx vitest run src/data/content.test.ts` — Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add demo/src/data && git commit -m "demo: all copy and image manifest as single content source (tested)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: bookTimeline.ts — pure math, TDD

**Files:**
- Create: `demo/src/lib/bookTimeline.ts`
- Test: `demo/src/lib/bookTimeline.test.ts`

**Interfaces:**
- Produces (consumed by Tasks 6, 8): `SPREADS=6`, `SHEETS=5`, `totalUnits(): number`, `sheetFlipStart(k): number`, `tocTargetUnits(spread): number`, `currentSpread(u): number`, `restAngle(k): number`, `coverOpenAngle(): number`, `zStacked(k): number`, `zFlipped(k): number`, `COVER_Z_CLOSED=20`, `COVER_Z_OPEN=1`, `faceFolio(kind, k): number`, `folioLabel(spread): string`, `RUNWAY_VH_PER_UNIT=110`.

- [ ] **Step 1: Write the failing test `demo/src/lib/bookTimeline.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import {
  COVER_Z_CLOSED, COVER_Z_OPEN, coverOpenAngle, currentSpread, faceFolio,
  folioLabel, restAngle, SHEETS, sheetFlipStart, SPREADS, tocTargetUnits,
  totalUnits, zFlipped, zStacked,
} from './bookTimeline'

describe('bookTimeline math', () => {
  it('has 6 spreads / 5 sheets and 7.3 total units', () => {
    expect(SPREADS).toBe(6)
    expect(SHEETS).toBe(5)
    expect(totalUnits()).toBeCloseTo(7.3, 5)
  })
  it('computes sheet flip starts: k=1 → 1.15, k=5 → 5.75', () => {
    expect(sheetFlipStart(1)).toBeCloseTo(1.15, 5)
    expect(sheetFlipStart(5)).toBeCloseTo(5.75, 5)
  })
  it('TOC target for spread k is 1.15·k units', () => {
    expect(tocTargetUnits(1)).toBeCloseTo(1.15, 5)
    expect(tocTargetUnits(4)).toBeCloseTo(4.6, 5)
    expect(tocTargetUnits(6)).toBeCloseTo(6.9, 5)
  })
  it('maps progress units to current spread (0=cover)', () => {
    expect(currentSpread(0)).toBe(0)
    expect(currentSpread(0.6)).toBe(1)     // cover half-open
    expect(currentSpread(1.66)).toBe(2)    // sheet 1 past midpoint
    expect(currentSpread(7.3)).toBe(6)     // end
  })
  it('staggers rest angles and manages z choreography', () => {
    expect(restAngle(1)).toBeCloseTo(-177.6, 5)
    expect(restAngle(5)).toBeCloseTo(-176.0, 5)
    expect(coverOpenAngle()).toBe(-179)
    expect(zStacked(1)).toBe(6)
    expect(zStacked(5)).toBe(2)
    expect(zFlipped(1)).toBe(8)
    expect(zFlipped(5)).toBe(12)
    expect(COVER_Z_CLOSED).toBe(20)
    expect(COVER_Z_OPEN).toBe(1)
    // flipping sheet k beats every already-flipped and every stacked sheet
    expect(zFlipped(3)).toBeGreaterThan(zFlipped(2))
    expect(zFlipped(3)).toBeGreaterThan(zStacked(4))
  })
  it('computes folio order and labels', () => {
    expect(faceFolio('coverFront', 0)).toBe(0)
    expect(faceFolio('coverBack', 0)).toBe(1)
    expect(faceFolio('sheetFront', 1)).toBe(2)   // R1
    expect(faceFolio('sheetBack', 1)).toBe(3)    // L2
    expect(faceFolio('sheetBack', 5)).toBe(11)   // L6
    expect(faceFolio('base', 0)).toBe(12)        // R6
    expect(folioLabel(2)).toBe('PAGE 03 — 04 / 12')
    expect(folioLabel(6)).toBe('PAGE 11 — 12 / 12')
    expect(folioLabel(0)).toBe('')
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run (in `demo/`): `npx vitest run src/lib/bookTimeline.test.ts`
Expected: FAIL — cannot resolve `./bookTimeline`.

- [ ] **Step 3: Write `demo/src/lib/bookTimeline.ts`**

```ts
export const SPREADS = 6
export const SHEETS = SPREADS - 1
export const RUNWAY_VH_PER_UNIT = 110

const COVER_OPEN = 1.0
const SETTLE = 0.15
const FLIP = 1.0
const FINAL = 0.4

export function totalUnits(): number {
  return COVER_OPEN + SETTLE + SHEETS * (FLIP + SETTLE) + FINAL
}

/** Timeline position (units) where sheet k (1-indexed) begins its flip. */
export function sheetFlipStart(k: number): number {
  return COVER_OPEN + SETTLE + (k - 1) * (FLIP + SETTLE)
}

/** Scroll target (units) that lands settled on spread k. */
export function tocTargetUnits(spread: number): number {
  return (COVER_OPEN + SETTLE) * spread // 1.15·k: cover+settle, then k−1 flip+settle blocks
}

/** Current spread for HUD: 0 = cover; spread k once sheet k−1 passes its midpoint. */
export function currentSpread(u: number): number {
  if (u < COVER_OPEN / 2) return 0
  let flipped = 0
  for (let k = 1; k <= SHEETS; k++) if (u >= sheetFlipStart(k) + FLIP / 2) flipped++
  return Math.min(1 + flipped, SPREADS)
}

export function restAngle(k: number): number {
  return -178 + 0.4 * k
}
export function coverOpenAngle(): number {
  return -179
}

export const COVER_Z_CLOSED = 20
export const COVER_Z_OPEN = 1
export function zStacked(k: number): number {
  return SHEETS + 2 - k
}
export function zFlipped(k: number): number {
  return SHEETS + 2 + k
}

export type FaceKind = 'coverFront' | 'coverBack' | 'sheetFront' | 'sheetBack' | 'base'
/** Reading order of a face (drives flat-mode flex `order` and folio math). */
export function faceFolio(kind: FaceKind, k: number): number {
  switch (kind) {
    case 'coverFront': return 0
    case 'coverBack': return 1
    case 'sheetFront': return 2 * k
    case 'sheetBack': return 2 * k + 1
    case 'base': return 2 * SPREADS
  }
}

export function folioLabel(spread: number): string {
  if (spread < 1) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `PAGE ${pad(2 * spread - 1)} — ${pad(2 * spread)} / ${2 * SPREADS}`
}
```

- [ ] **Step 4: Run tests to verify pass**

Run (in `demo/`): `npx vitest run` — Expected: PASS (both test files; note `tocTargetUnits(k) = 1.15k` only equals "settled on spread k" because `COVER_OPEN + SETTLE === FLIP + SETTLE`; the test pins the values).

- [ ] **Step 5: Commit**

```bash
git add demo/src/lib && git commit -m "demo: book timeline math as pure tested module (units, z, folios)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Page-face components + static book DOM

**Files:**
- Create: `demo/src/components/pages/CoverFace.tsx`, `Frontispiece.tsx`, `TocPage.tsx`, `CraftPages.tsx`, `CatalogPages.tsx`, `RecordPages.tsx`, `ColophonPage.tsx`, `BackCoverFace.tsx`
- Create: `demo/src/components/Book.tsx` (static DOM this task; animation in Task 8)
- Modify: `demo/src/App.tsx`

**Interfaces:**
- Consumes: everything from `data/content` and `lib/bookTimeline` (Task 4/5 signatures).
- Produces: `<Book flat started />` with DOM classes/refs Task 8 animates: `.cover`, `.sheet` ×5, `.base-right`, `.sheet-shade`, `.develop`, `.ribbon`, `.page-edges`, `.spine`, `.cta-glint`; chapter faces carry `id="ch-1..4"`; `TocPage` takes `onNav?: (spread: number, hash: string) => void`.

- [ ] **Step 1: Write the page components**

`demo/src/components/pages/CoverFace.tsx`:

```tsx
import { BRAND, COVER_HINT, TAGLINE } from '../../data/content'

export default function CoverFace({ onOpen }: { onOpen?: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="page-pad noise w-full cursor-pointer items-center justify-center gap-6 text-center" aria-label="Open the book">
      <span className="mono text-[0.6rem] tracking-[0.5em] text-gold/70">A MOODLE-POWERED ACADEMY · EST. MMXXVI</span>
      <svg viewBox="0 0 32 32" className="h-16 w-16" aria-hidden="true">
        <path d="M16 8c-2.5-1.6-5.5-2-9-2v18c3.5 0 6.5.4 9 2 2.5-1.6 5.5-2 9-2V6c-3.5 0-6.5.4-9 2z" fill="none" stroke="#C9A45C" strokeWidth="1.2" />
        <path d="M16 8v18" stroke="#C9A45C" strokeWidth="0.9" />
      </svg>
      <h1 className="foil font-display text-[clamp(2rem,4.5vw,3.6rem)] font-semibold leading-none tracking-[0.18em]">{BRAND}</h1>
      <p className="font-display text-lg italic text-ink/80">{TAGLINE}</p>
      <span className="mono mt-6 animate-pulse text-[0.65rem] tracking-[0.4em] text-ink/50">▼ {COVER_HINT}</span>
    </button>
  )
}
```

`demo/src/components/pages/Frontispiece.tsx`:

```tsx
import { imageById } from '../../data/content'

export default function Frontispiece() {
  const img = imageById('frontispiece-emblem')
  return (
    <div className="page-pad noise items-center justify-center gap-5 text-center">
      <img src={img.src} alt={img.alt} className="h-[52%] w-auto object-cover opacity-90" loading="eager" />
      <p className="font-display text-sm italic text-ink/60">"A course well bound is a course well taught."</p>
      <span className="mono text-[0.6rem] tracking-[0.4em] text-gold/60">FRONTISPIECE</span>
    </div>
  )
}
```

`demo/src/components/pages/TocPage.tsx`:

```tsx
import { TOC } from '../../data/content'

export default function TocPage({ onNav }: { onNav?: (spread: number, hash: string) => void }) {
  return (
    <nav className="page-pad noise justify-center" aria-label="Table of contents">
      <span className="mono mb-6 text-[0.65rem] tracking-[0.45em] text-gold/70">TABLE OF CONTENTS</span>
      <ol className="flex flex-col gap-5">
        {TOC.map(t => (
          <li key={t.hash}>
            <a
              href={`#${t.hash}`}
              className="group block border-b border-gold/20 pb-3"
              onClick={e => {
                if (!onNav) return
                e.preventDefault()
                history.replaceState(null, '', `#${t.hash}`)
                onNav(t.spread, t.hash)
              }}
            >
              <span className="mono mr-4 text-xs text-gold/80">{t.num}.</span>
              <span className="font-display text-2xl text-ink group-hover:text-gold">{t.title}</span>
              <span className="mono float-right mt-2 text-[0.6rem] tracking-[0.2em] text-ink/45">{t.sub.toUpperCase()}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
```

`demo/src/components/pages/CraftPages.tsx`:

```tsx
import { FEATURES_A, FEATURES_B, imageById, type Feature } from '../../data/content'

function FeatureList({ items }: { items: Feature[] }) {
  return (
    <ul className="flex flex-col gap-5">
      {items.map(f => (
        <li key={f.title} className="border-l border-gold/30 pl-4">
          <h3 className="font-display text-xl font-semibold text-ink">{f.title}</h3>
          <p className="mt-1 font-display text-[0.95rem] leading-relaxed text-ink/70">{f.body}</p>
        </li>
      ))}
    </ul>
  )
}

function IllustrationPage({ imgId, chapter, title, blurb, anchorId }: { imgId: string; chapter: string; title: string; blurb: string; anchorId?: string }) {
  const img = imageById(imgId)
  return (
    <div id={anchorId} className="page-pad noise justify-between">
      <span className="mono text-[0.65rem] tracking-[0.45em] text-gold/70">{chapter}</span>
      <img src={img.src} alt={img.alt} className="my-4 max-h-[55%] w-full object-cover" loading="lazy" />
      <div>
        <h2 className="font-display text-3xl font-semibold text-ink">{title}</h2>
        <p className="mt-2 font-display text-sm italic leading-relaxed text-ink/60">{blurb}</p>
      </div>
    </div>
  )
}

export const CraftLeft = () => (
  <IllustrationPage anchorId="ch-1" imgId="craft-inkwell" chapter="CHAPTER I" title="The Craft"
    blurb="Everything a teaching hand needs — laid out in the order a teacher reaches for it." />
)
export const CraftRight = () => (
  <div className="page-pad noise justify-center"><FeatureList items={FEATURES_A} /></div>
)
export const CraftContLeft = () => (
  <IllustrationPage imgId="craft-seal" chapter="CHAPTER I · CONTINUED" title="Sealed & Delivered"
    blurb="From discussion to certification, the academy travels with its learners." />
)
export const CraftContRight = () => (
  <div className="page-pad noise justify-center"><FeatureList items={FEATURES_B} /></div>
)
```

`demo/src/components/pages/CatalogPages.tsx`:

```tsx
import { COURSES, type Course } from '../../data/content'

function CourseCard({ c }: { c: Course }) {
  return (
    <figure className="flex flex-col gap-2">
      <img src={c.image} alt={c.alt} className="aspect-[2/3] w-full object-cover" loading="lazy" />
      <figcaption>
        <span className="font-display text-lg leading-tight text-ink">{c.title}</span>
        <span className="mono mt-1 block text-[0.6rem] tracking-[0.25em] text-gold/70">✦ {c.lessons} LESSONS</span>
      </figcaption>
    </figure>
  )
}

function CatalogHalf({ courses, anchorId, headed }: { courses: Course[]; anchorId?: string; headed?: boolean }) {
  return (
    <div id={anchorId} className="page-pad noise justify-center gap-5">
      {headed && <span className="mono text-[0.65rem] tracking-[0.45em] text-gold/70">CHAPTER II · THE CATALOG</span>}
      <div className="grid grid-cols-2 gap-5">{courses.map(c => <CourseCard key={c.id} c={c} />)}</div>
    </div>
  )
}

export const CatalogLeft = () => <CatalogHalf courses={COURSES.slice(0, 2)} anchorId="ch-2" headed />
export const CatalogRight = () => <CatalogHalf courses={COURSES.slice(2)} />
```

`demo/src/components/pages/RecordPages.tsx`:

```tsx
import { imageById, STATS, STATS_NOTE, TESTIMONIAL } from '../../data/content'

export const RecordLeft = () => {
  const img = imageById('record-armillary')
  return (
    <div id="ch-3" className="page-pad noise justify-between">
      <span className="mono text-[0.65rem] tracking-[0.45em] text-gold/70">CHAPTER III · THE RECORD</span>
      <img src={img.src} alt={img.alt} className="my-3 max-h-[38%] w-full object-cover" loading="lazy" />
      <dl className="flex flex-col gap-3">
        {STATS.map(s => (
          <div key={s.label} className="flex items-baseline justify-between border-b border-gold/20 pb-2">
            <dt className="mono text-[0.65rem] tracking-[0.3em] text-ink/55">{s.label.toUpperCase()}</dt>
            <dd className="mono text-2xl text-gold">{s.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mono mt-2 text-[0.55rem] tracking-[0.2em] text-ink/40">{STATS_NOTE.toUpperCase()}</p>
    </div>
  )
}

export const RecordRight = () => (
  <div className="page-pad noise justify-center gap-6">
    <span className="font-display text-6xl leading-none text-gold/40">"</span>
    <blockquote className="font-display text-2xl italic leading-relaxed text-ink/90">{TESTIMONIAL.quote}</blockquote>
    <p className="mono text-[0.65rem] tracking-[0.25em] text-ink/55">
      — {TESTIMONIAL.name.toUpperCase()}<br />{TESTIMONIAL.role.toUpperCase()}
    </p>
  </div>
)
```

`demo/src/components/pages/ColophonPage.tsx`:

```tsx
import { imageById, TRIAL } from '../../data/content'

export default function ColophonLeft() {
  const img = imageById('colophon-candle')
  return (
    <div id="ch-4" className="page-pad noise justify-between">
      <span className="mono text-[0.65rem] tracking-[0.45em] text-gold/70">CHAPTER IV · BEGIN</span>
      <img src={img.src} alt={img.alt} className="my-3 max-h-[34%] w-full object-cover" loading="lazy" />
      <div>
        <h2 className="font-display text-3xl font-semibold text-ink">{TRIAL.heading}</h2>
        <ul className="mt-4 flex flex-col gap-2">
          {TRIAL.points.map(p => (
            <li key={p} className="font-display text-[0.95rem] text-ink/75">
              <span className="mr-2 text-gold">✦</span>{p}
            </li>
          ))}
        </ul>
      </div>
      <p className="mono text-[0.55rem] leading-relaxed tracking-[0.15em] text-ink/40">{TRIAL.credit.toUpperCase()}</p>
    </div>
  )
}
```

`demo/src/components/pages/BackCoverFace.tsx`:

```tsx
import { BRAND, TRIAL } from '../../data/content'

export default function BackCoverFace() {
  return (
    <div className="page-pad noise items-center justify-center gap-6 text-center">
      <span className="mono text-[0.6rem] tracking-[0.5em] text-gold/60">THE FINAL PAGE</span>
      <h2 className="font-display text-[clamp(1.8rem,3.2vw,2.8rem)] font-semibold text-ink">Write the next chapter yourself.</h2>
      <a
        href="#ch-4"
        onClick={e => e.preventDefault()}
        className="border border-gold bg-gold/10 px-10 py-4 font-display text-xl tracking-wide text-gold transition-colors hover:bg-gold hover:text-obsidian"
        aria-describedby="cta-note"
      >
        {TRIAL.cta}
      </a>
      <p className="font-display text-sm italic text-ink/60">{TRIAL.ctaSub}</p>
      <p id="cta-note" className="mono text-[0.55rem] tracking-[0.2em] text-ink/35">DEMO BUILD — BUTTON INTENTIONALLY INERT</p>
      <span className="mono mt-4 text-[0.55rem] tracking-[0.4em] text-ink/30">{BRAND} · MMXXVI</span>
      <div className="cta-glint" aria-hidden="true" />
    </div>
  )
}
```

- [ ] **Step 2: Write `demo/src/components/Book.tsx` (static structure; Task 8 adds motion)**

```tsx
import { useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { faceFolio, RUNWAY_VH_PER_UNIT, totalUnits, zStacked, COVER_Z_CLOSED } from '../lib/bookTimeline'
import CoverFace from './pages/CoverFace'
import Frontispiece from './pages/Frontispiece'
import TocPage from './pages/TocPage'
import { CraftContLeft, CraftContRight, CraftLeft, CraftRight } from './pages/CraftPages'
import { CatalogLeft, CatalogRight } from './pages/CatalogPages'
import { RecordLeft, RecordRight } from './pages/RecordPages'
import ColophonLeft from './pages/ColophonPage'
import BackCoverFace from './pages/BackCoverFace'

const folioStyle = (n: number): CSSProperties => ({ ['--folio' as string]: n })

export default function Book({ flat, started }: { flat: boolean; started: boolean }) {
  const runwayRef = useRef<HTMLDivElement>(null)
  const bookRef = useRef<HTMLDivElement>(null)
  const [spread, setSpread] = useState(0)
  void spread; void setSpread; void started // wired in Task 8

  const scrollToSpread = (_spread: number, hash: string) => {
    if (flat) document.getElementById(hash)?.scrollIntoView() // book mode wired in Task 8
  }

  const sheetFaces: [ReactNode, ReactNode][] = [
    [<TocPage key="r1" onNav={scrollToSpread} />, <CraftLeft key="l2" />],
    [<CraftRight key="r2" />, <CraftContLeft key="l3" />],
    [<CraftContRight key="r3" />, <CatalogLeft key="l4" />],
    [<CatalogRight key="r4" />, <RecordLeft key="l5" />],
    [<RecordRight key="r5" />, <ColophonLeft key="l6" />],
  ]

  return (
    <div ref={runwayRef} className="runway" style={{ height: flat ? 'auto' : `${totalUnits() * RUNWAY_VH_PER_UNIT}vh` }}>
      <div className="book-stage">
        <div className="book-persp">
          <div ref={bookRef} className="book">
            <div className="leaf cover" style={{ zIndex: COVER_Z_CLOSED }}>
              <div className="face front leather" style={folioStyle(faceFolio('coverFront', 0))}>
                <CoverFace onOpen={() => scrollToSpread(1, 'ch-1')} />
              </div>
              <div className="face back paper" style={folioStyle(faceFolio('coverBack', 0))}>
                <Frontispiece />
              </div>
            </div>
            {sheetFaces.map(([front, back], i) => (
              <div key={i} className="leaf sheet" style={{ zIndex: zStacked(i + 1) }}>
                <div className="face front paper" style={folioStyle(faceFolio('sheetFront', i + 1))}>
                  {front}
                  <div className="develop" />
                </div>
                <div className="face back paper" style={folioStyle(faceFolio('sheetBack', i + 1))}>{back}</div>
                <div className="sheet-shade" />
              </div>
            ))}
            <div className="leaf base-right" style={{ zIndex: 0 }}>
              <div className="face front paper" style={folioStyle(faceFolio('base', 0))}>
                <BackCoverFace />
                <div className="develop" />
              </div>
            </div>
            <div className="spine" aria-hidden="true" />
            <div className="page-edges" aria-hidden="true" />
            <div className="ribbon" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Wire `demo/src/App.tsx`**

```tsx
import { useEffect, useState } from 'react'
import Book from './components/Book'

export const FLAT_QUERY = '(max-width: 767px), (prefers-reduced-motion: reduce)'

export default function App() {
  const [flat, setFlat] = useState(() => window.matchMedia(FLAT_QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(FLAT_QUERY)
    const onChange = () => setFlat(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return (
    <div className={flat ? 'book-flat' : ''}>
      <main>
        <Book flat={flat} started />
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Add missing Tailwind color utilities check + build**

The classes `text-gold/70`, `text-ink/80`, `text-obsidian`, `border-gold` resolve from the `@theme` tokens (Tailwind v4 derives utilities from `--color-*`). Run (in `demo/`): `npm run build`
Expected: `✓ built`, no TS errors. (Missing images are fine — they arrive in Task 10.)

- [ ] **Step 5: Commit**

```bash
git add demo/src && git commit -m "demo: static book DOM with all 12 page faces and flat-mode ordering

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: Atmosphere, Preloader, HUD shells

**Files:**
- Create: `demo/src/components/Atmosphere.tsx`, `demo/src/components/Preloader.tsx`, `demo/src/components/BookHUD.tsx`
- Modify: `demo/src/App.tsx`

**Interfaces:**
- Produces: `<Preloader onDone />` (counts 000→100, wipes, instant under reduced-motion, 3.5s failsafe); `<BookHUD spread label head />`; App passes `started` (preloader done) into `<Book>`.

- [ ] **Step 1: Write `demo/src/components/Atmosphere.tsx`**

```tsx
export default function Atmosphere() {
  return (
    <div className="atm" aria-hidden="true">
      <div className="atm-blob a" />
      <div className="atm-blob b" />
      <div className="atm-glow" />
    </div>
  )
}
```

- [ ] **Step 2: Write `demo/src/components/Preloader.tsx`**

```tsx
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { BRAND } from '../data/content'

export default function Preloader({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)
  const doneRef = useRef(false)

  useEffect(() => {
    const finish = () => {
      if (doneRef.current) return
      doneRef.current = true
      onDone()
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish()
      return
    }
    const counter = { v: 0 }
    const tl = gsap.timeline()
    tl.to(counter, {
      v: 100, duration: 1.6, ease: 'power2.inOut',
      onUpdate: () => {
        if (numRef.current) numRef.current.textContent = String(Math.round(counter.v)).padStart(3, '0')
      },
    })
    tl.to('.wipe', { scaleY: 0, transformOrigin: 'top', duration: 0.7, ease: 'power4.inOut', stagger: 0.08 })
    tl.to(rootRef.current, { autoAlpha: 0, duration: 0.25 }, '<0.45')
    tl.call(finish)
    const failsafe = window.setTimeout(finish, 3500)
    return () => {
      window.clearTimeout(failsafe)
      tl.kill()
    }
  }, [onDone])

  return (
    <div ref={rootRef} className="preloader" aria-hidden="true">
      <div className="wipe" />
      <div className="wipe" />
      <div className="preloader-center">
        <span className="foil font-display text-2xl tracking-[0.25em]">{BRAND}</span>
        <span ref={numRef} className="mono text-sm tracking-[0.4em] text-ink/60">000</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write `demo/src/components/BookHUD.tsx`**

```tsx
export default function BookHUD({ spread, label, head }: { spread: number; label: string; head: string }) {
  const visible = spread >= 1
  return (
    <>
      <div className="hud-head" style={{ opacity: visible && head ? 1 : 0 }} aria-hidden="true">{head}</div>
      <div className="hud-folio" style={{ opacity: visible ? 1 : 0 }} aria-hidden="true">{label}</div>
    </>
  )
}
```

- [ ] **Step 4: Update `demo/src/App.tsx`**

```tsx
import { useCallback, useEffect, useState } from 'react'
import Atmosphere from './components/Atmosphere'
import Preloader from './components/Preloader'
import Book from './components/Book'

export const FLAT_QUERY = '(max-width: 767px), (prefers-reduced-motion: reduce)'

export default function App() {
  const [flat, setFlat] = useState(() => window.matchMedia(FLAT_QUERY).matches)
  const [ready, setReady] = useState(false)
  const onDone = useCallback(() => setReady(true), [])
  useEffect(() => {
    const mq = window.matchMedia(FLAT_QUERY)
    const onChange = () => setFlat(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return (
    <div className={flat ? 'book-flat' : ''}>
      <Atmosphere />
      {!ready && <Preloader onDone={onDone} />}
      <main>
        <Book flat={flat} started={ready} />
      </main>
      <div className="grain" aria-hidden="true" />
    </div>
  )
}
```

- [ ] **Step 5: Build + commit**

Run (in `demo/`): `npm run build` — Expected: `✓ built`.

```bash
git add demo/src && git commit -m "demo: atmosphere layer, preloader with failsafe + reduced-motion skip, HUD shell

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: Master timeline, Lenis, HUD wiring, TOC/hash navigation

**Files:**
- Modify: `demo/src/components/Book.tsx` (full replacement below)

**Interfaces:**
- Consumes: all `bookTimeline` exports; `TOC`, `CHAPTER_HEADS` from content; `BookHUD`.
- Produces: the complete book-mode experience (cover open + re-center, 5 choreographed flips, shade/develop, ribbon/edges/spine, HUD spread state, TOC scrollTo, `#ch-N` deep links).

- [ ] **Step 1: Replace `demo/src/components/Book.tsx` entirely with**

```tsx
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import {
  COVER_Z_CLOSED, COVER_Z_OPEN, coverOpenAngle, currentSpread, faceFolio,
  folioLabel, restAngle, RUNWAY_VH_PER_UNIT, SHEETS, sheetFlipStart,
  tocTargetUnits, totalUnits, zFlipped, zStacked,
} from '../lib/bookTimeline'
import { CHAPTER_HEADS, TOC } from '../data/content'
import BookHUD from './BookHUD'
import CoverFace from './pages/CoverFace'
import Frontispiece from './pages/Frontispiece'
import TocPage from './pages/TocPage'
import { CraftContLeft, CraftContRight, CraftLeft, CraftRight } from './pages/CraftPages'
import { CatalogLeft, CatalogRight } from './pages/CatalogPages'
import { RecordLeft, RecordRight } from './pages/RecordPages'
import ColophonLeft from './pages/ColophonPage'
import BackCoverFace from './pages/BackCoverFace'

gsap.registerPlugin(ScrollTrigger)

const folioStyle = (n: number): CSSProperties => ({ ['--folio' as string]: n })

export default function Book({ flat, started }: { flat: boolean; started: boolean }) {
  const runwayRef = useRef<HTMLDivElement>(null)
  const bookRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const [spread, setSpread] = useState(0)

  // Lenis smooth scroll (book mode only; preloader gates start)
  useEffect(() => {
    if (flat) return
    const lenis = new Lenis({ lerp: 0.09 })
    lenisRef.current = lenis
    lenis.stop()
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [flat])

  useEffect(() => {
    if (started) lenisRef.current?.start()
  }, [started])

  const scrollToSpread = (target: number, hash: string, jump = false) => {
    if (flat) {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    const runway = runwayRef.current
    if (!runway) return
    const max = runway.offsetHeight - window.innerHeight
    const y = runway.offsetTop + (tocTargetUnits(target) / totalUnits()) * max
    if (lenisRef.current) lenisRef.current.scrollTo(y, jump ? { immediate: true } : { duration: 1.6 })
    else window.scrollTo({ top: y })
  }

  // Master timeline
  useEffect(() => {
    if (flat) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const book = bookRef.current
      const runway = runwayRef.current
      if (!book || !runway) return
      const cover = book.querySelector<HTMLElement>('.cover')!
      const sheets = gsap.utils.toArray<HTMLElement>('.sheet', book)
      const baseDevelop = book.querySelector<HTMLElement>('.base-right .develop')!

      gsap.set(book, { xPercent: -25 })
      gsap.set(cover, { zIndex: COVER_Z_CLOSED })
      sheets.forEach((el, i) => gsap.set(el, { zIndex: zStacked(i + 1) }))
      gsap.set(book.querySelectorAll('.sheet .develop'), { opacity: 0.45 })
      gsap.set(baseDevelop, { opacity: 0.45 })

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: runway,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          onUpdate: self => {
            const s = currentSpread(self.progress * totalUnits())
            setSpread(prev => (prev === s ? prev : s))
          },
        },
      })

      // Cover opens; book re-centers on its spine; spine appears; chrome starts
      tl.to(book, { xPercent: 0, duration: 1 }, 0)
      tl.to(cover, { rotationY: coverOpenAngle(), duration: 1 }, 0)
      tl.to('.spine', { opacity: 1, duration: 0.2 }, 0.9)
      tl.set(cover, { zIndex: COVER_Z_OPEN }, 1.05)
      tl.to('.ribbon', { scaleY: 1, duration: totalUnits() - 1, ease: 'none' }, 1)
      tl.to('.page-edges', { scaleX: 0, duration: totalUnits() - 1.15, ease: 'none' }, 1.15)

      // Sheet flips with z choreography, shade, and develop on the incoming right page
      sheets.forEach((el, i) => {
        const k = i + 1
        const at = sheetFlipStart(k)
        const shade = el.querySelector('.sheet-shade')
        const nextDevelop = k < SHEETS ? sheets[k].querySelector('.develop') : baseDevelop
        tl.set(el, { zIndex: zFlipped(k), willChange: 'transform' }, at)
        tl.to(el, { rotationY: restAngle(k), duration: 1 }, at)
        tl.set(el, { willChange: 'auto' }, at + 1)
        tl.to(shade, { opacity: 0.5, duration: 0.5, ease: 'power1.in' }, at)
        tl.to(shade, { opacity: 0, duration: 0.5, ease: 'power1.out' }, at + 0.5)
        tl.to(nextDevelop, { opacity: 0, duration: 0.4, ease: 'power1.out' }, at + 0.3)
      })

      // Final CTA emphasis
      tl.fromTo('.cta-glint', { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power1.in' }, totalUnits() - 0.4)

      // Hash deep link (e.g. hard-load /#ch-2)
      const match = location.hash.match(/^#ch-(\d)$/)
      if (match) {
        const entry = TOC[Number(match[1]) - 1]
        if (entry) requestAnimationFrame(() => scrollToSpread(entry.spread, entry.hash, true))
      }
      return () => setSpread(0)
    })
    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flat])

  const sheetFaces: [ReactNode, ReactNode][] = [
    [<TocPage key="r1" onNav={(s, h) => scrollToSpread(s, h)} />, <CraftLeft key="l2" />],
    [<CraftRight key="r2" />, <CraftContLeft key="l3" />],
    [<CraftContRight key="r3" />, <CatalogLeft key="l4" />],
    [<CatalogRight key="r4" />, <RecordLeft key="l5" />],
    [<RecordRight key="r5" />, <ColophonLeft key="l6" />],
  ]

  return (
    <>
      {!flat && <BookHUD spread={spread} label={folioLabel(spread)} head={CHAPTER_HEADS[spread] ?? ''} />}
      <div ref={runwayRef} className="runway" style={{ height: flat ? 'auto' : `${totalUnits() * RUNWAY_VH_PER_UNIT}vh` }}>
        <div className="book-stage">
          <div className="book-persp">
            <div ref={bookRef} className="book">
              <div className="leaf cover" style={{ zIndex: COVER_Z_CLOSED }}>
                <div className="face front leather" style={folioStyle(faceFolio('coverFront', 0))}>
                  <CoverFace onOpen={() => scrollToSpread(1, 'ch-1')} />
                </div>
                <div className="face back paper" style={folioStyle(faceFolio('coverBack', 0))}>
                  <Frontispiece />
                </div>
              </div>
              {sheetFaces.map(([front, back], i) => (
                <div key={i} className="leaf sheet" style={{ zIndex: zStacked(i + 1) }}>
                  <div className="face front paper" style={folioStyle(faceFolio('sheetFront', i + 1))}>
                    {front}
                    <div className="develop" />
                  </div>
                  <div className="face back paper" style={folioStyle(faceFolio('sheetBack', i + 1))}>{back}</div>
                  <div className="sheet-shade" />
                </div>
              ))}
              <div className="leaf base-right" style={{ zIndex: 0 }}>
                <div className="face front paper" style={folioStyle(faceFolio('base', 0))}>
                  <BackCoverFace />
                  <div className="develop" />
                </div>
              </div>
              <div className="spine" aria-hidden="true" />
              <div className="page-edges" aria-hidden="true" />
              <div className="ribbon" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Build + manual smoke**

Run (in `demo/`): `npm run build` — Expected: `✓ built`.
Run (in `demo/`, background): `npm run dev` — open `http://localhost:5173`, scroll once top-to-bottom: cover opens and re-centers, five flips land on the CTA. (Full screenshot protocol is Task 11; this is a quick sanity pass.)

- [ ] **Step 3: Commit**

```bash
git add demo/src && git commit -m "demo: master scrubbed timeline — cover open, z-choreographed flips, HUD, TOC + hash nav

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 9: Accessibility + fallback polish

**Files:**
- Modify: `demo/src/components/Book.tsx` (three surgical edits below)

**Interfaces:**
- Consumes: Task 8's Book.
- Produces: `inert`/`aria-hidden` on non-current faces in book mode; visible focus styles; skip link.

- [ ] **Step 1: Hide non-visible faces from AT in book mode**

In `Book.tsx`, inside the `onUpdate` handler after `setSpread(...)`, screen-reader users on desktop should not tab into pages that are visually hidden mid-stack. Simplest robust approach: mark the whole 3D book as a single landmark and expose a parallel skip link. Add to the `onUpdate`-adjacent code — specifically, replace the `sheetFaces.map` face rendering's front/back `div.face` elements so each carries `inert` when not part of the current or adjacent spread. Implementation: add before `return`:

```tsx
  // Which faces are interactable at the current spread (book mode):
  // fronts belong to spread k (front of sheet k = R_k), backs to spread k+1.
  const frontActive = (k: number) => !flat && (spread === k || spread === k + 1)
  const backActive = (k: number) => !flat && (spread === k + 1 || spread === k + 2)
```

and change the two face divs inside `sheetFaces.map` to:

```tsx
                  <div className="face front paper" inert={!flat && !frontActive(i + 1) ? true : undefined} style={folioStyle(faceFolio('sheetFront', i + 1))}>
```

```tsx
                  <div className="face back paper" inert={!flat && !backActive(i + 1) ? true : undefined} style={folioStyle(faceFolio('sheetBack', i + 1))}>
```

(In flat mode `inert` is never set — all content reachable.)

- [ ] **Step 2: Skip link + landmark**

In `App.tsx`, as the first child of the wrapper div, add:

```tsx
      <a href="#ch-4" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:bg-obsidian focus:px-4 focus:py-2 focus:text-gold mono text-xs">
        Skip to trial offer
      </a>
```

- [ ] **Step 3: Focus visibility**

Append to `global.css`:

```css
a:focus-visible, button:focus-visible {
  outline: 1px solid var(--color-gold); outline-offset: 3px;
}
```

- [ ] **Step 4: Build, then verify inert typing**

Run (in `demo/`): `npm run build` — Expected: `✓ built` (React 19 supports the boolean `inert` prop natively).

- [ ] **Step 5: Commit**

```bash
git add demo/src && git commit -m "demo: a11y — inert off-spread faces, skip link, focus-visible styles

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 10: Generate imagery (banana), contact-sheet QA, wire, audit

**Files:**
- Create: `demo/public/images/*.png` (9 files), `demo/public/og/cover-og.png`
- Create (scratch, not committed): contact-sheet HTML in the session scratchpad

**Interfaces:**
- Consumes: `IMAGES` manifest ids/paths from `data/content.ts` (Task 4).
- Produces: all 10 assets on disk at exactly the manifest paths.

- [ ] **Step 1: Generate 10 images with the banana skill**

Invoke the `banana-claude:banana` skill once per image (or batch if it supports it). Every prompt = subject + the locked template VERBATIM:

Template (append to each): `dark cinematic 3D render, obsidian black and brushed gold metallic materials, single hard rim light from upper left, volumetric fog, deep navy-black background, high contrast, subtle film grain, monochrome with warm gold accents, no text, no watermark`

| id | subject prompt (prepend) | aspect |
|---|---|---|
| frontispiece-emblem | an emblem plate: an open ancient tome encircled by a laurel wreath, centered, symmetrical | 1:1 |
| craft-inkwell | a feather quill resting in a brass inkwell on a dark desk | 3:2 |
| craft-seal | a brass wax seal stamp resting on dark parchment documents with one gold wax seal | 3:2 |
| catalog-astrolabe | an intricate brass astrolabe suspended in darkness | 2:3 |
| catalog-compass | a gold drafting compass standing upright on dark parchment | 2:3 |
| catalog-botany | a preserved botanical specimen inside a glass dome on a dark plinth | 2:3 |
| catalog-lyre | an ornate gold lyre emerging from darkness | 2:3 |
| record-armillary | a brass armillary sphere with concentric rings | 3:2 |
| colophon-candle | a lit candle in a brass holder beside a stack of dark leather-bound tomes | 3:2 |
| cover-og | a closed obsidian-black leather book with blank gold-foil-bordered cover, three-quarter hero view on a dark desk | 16:9 |

Copy/convert each output to `demo/public/images/<id>.png` (og → `demo/public/og/cover-og.png`). If the tool emits JPG/WebP, convert to PNG or update ALL manifest extensions in `content.ts` + `content.test.ts` consistently.

- [ ] **Step 2: Contact-sheet QA**

Write `<scratchpad>/contact-sheet.html` — an 80-line static grid `<img>` page listing all 10 files from `demo/public/` (use `file:///` paths) — open it in Chrome (claude-in-chrome tools), screenshot, and judge: one universe? rim light upper-left? no text/watermark artifacts? Regenerate any offender (budget ≤2 regens; if an image still fails, prefer the closest pass — unity beats subject fidelity).

- [ ] **Step 3: Watermark check + crop if needed**

Inspect the contact sheet's bottom edges. If any generator mark exists, crop bottom 5.5% with the PIL snippet from `references/imagery-universe.md` (`python -c` one-liner per file). If Python/PIL is unavailable, note it and regenerate the offending image instead.

- [ ] **Step 4: Audit wiring**

Run (repo root): `python scripts/audit_images.py demo`
Expected output: `referenced: 10 | in public/: 11` (favicon.svg is unused-by-src but referenced from index.html — the script scans index.html too, so expect `clean`; investigate anything flagged MISSING).

- [ ] **Step 5: Commit**

```bash
git add demo/public && git commit -m "demo: one-universe generated imagery (midnight tome template), QA'd on contact sheet

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 11: Local visual verification protocol (+ fix loop)

**Files:**
- None planned (fixes discovered here are made where they live; each fix gets its own commit).

**Interfaces:**
- Consumes: the complete local build.
- Produces: a reviewed set of screenshots; a fixed, visually-correct site.

- [ ] **Step 1: Serve the production build**

Run (in `demo/`): `npm run build && npm run preview` (background) — note the port (default 4173).

- [ ] **Step 2: Screenshot at 6 depths (claude-in-chrome)**

Load browser tools (one ToolSearch batch), open `http://localhost:4173`, wait for preloader, then for each target unit u in {0, 0.5, 1.65, 3.95, 5.2, 7.3}: set scroll via `javascript_tool`:
`window.scrollTo(0, (u / 7.3) * (document.documentElement.scrollHeight - innerHeight))`
then screenshot. Review each against: cover centered (u=0); mid-open shows frontispiece + re-centering (0.5); sheet-1 mid-flip shows shade + TOC turning + Craft developing (1.65); catalog forming (3.95); record spread (5.2); CTA + glint + full ribbon (7.3).

- [ ] **Step 3: Reduced-motion + mobile checks**

- Emulate `prefers-reduced-motion: reduce` (CDP or OS setting), reload: expect flat stacked layout, no preloader wait, ALL 13 faces' content visible in reading order.
- Resize window to 390×844, reload: same flat expectations.

- [ ] **Step 4: Hash deep link (local)**

Hard-load `http://localhost:4173/#ch-2` — expect the catalog spread settled (not the cover).

- [ ] **Step 5: Fix loop**

Any defect: use superpowers:systematic-debugging (root cause, not tweaks), fix, rebuild, re-screenshot THAT depth. Commit each fix separately:

```bash
git add -A && git commit -m "fix(demo): <what was actually wrong>

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 12: Deploy to Vercel + live verification

**Files:**
- Possibly create: `demo/vercel.json` (only if the deploy requires config; a static Vite build should not).

**Interfaces:**
- Consumes: verified local build.
- Produces: live `https://<project>.vercel.app` URL, smoke-tested.

- [ ] **Step 1: Load Vercel tools and deploy**

ToolSearch: `select:mcp__claude_ai_Vercel__deploy_to_vercel,mcp__claude_ai_Vercel__get_deployment,mcp__claude_ai_Vercel__get_deployment_build_logs,mcp__claude_ai_Vercel__list_teams`
Deploy per the schema (project name `codex-academy`, framework Vite, root `demo/`). If the tool deploys source, ensure build command `npm run build`, output `dist`. If it fails twice: fallback `npx vercel deploy --prod` (needs interactive login — hand the user the `! npx vercel login` command); final fallback GitHub Pages (then set Vite `base` to `/<repo>/` per gotcha #1).

- [ ] **Step 2: Wait for READY + fetch URL**

Poll `get_deployment` until READY; on error read `get_deployment_build_logs` and fix.

- [ ] **Step 3: Live smoke (claude-in-chrome)**

On the live URL: screenshot cover (u=0), one mid-flip (u=1.65), CTA (u=7.3); hard-load `<url>/#ch-2`; confirm og tags by viewing page source. Expected: identical to local.

- [ ] **Step 4: Quick Lighthouse pass**

Chrome DevTools Lighthouse (or PageSpeed) on the live URL, mobile + desktop: sanity only — no console errors, perf not tanking (<2.5s LCP target), a11y no red flags. Record numbers in the final report; fix only real issues.

- [ ] **Step 5: Commit any deploy artifacts**

```bash
git add -A && git commit -m "demo: deploy to Vercel (codex-academy) — live URL verified

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 13: Back-port build learnings into the skill

**Files:**
- Modify: `references/book-mode.md` (remove DRAFT note; correct anything reality changed — angles, z timing, sticky-vs-pin, perf choices, StrictMode/Lenis notes)
- Modify: `SKILL.md` (append newly discovered gotchas to Gotchas; only ones that actually cost time in Tasks 8–12)

**Interfaces:**
- Consumes: the fix-loop history from Task 11/12 (git log of `fix(demo):` commits is the source of truth).

- [ ] **Step 1: Review `git log --oneline` for every `fix(demo):` commit; for each, decide: was this a recipe error (fix book-mode.md), a missing gotcha (add to SKILL.md), or a one-off (ignore)?**

- [ ] **Step 2: Apply the edits; remove the "DRAFT status" sentence from book-mode.md**

- [ ] **Step 3: Commit**

```bash
git add SKILL.md references && git commit -m "Skill: back-port book-mode learnings from the Codex Academy build

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 14: Install skill + final report

**Files:**
- Create: `C:\Users\amerk\.claude\skills\cinematic-scroll-landing\` (copy of SKILL.md, references/, scripts/ — NOT demo/, docs/, .git/)

**Interfaces:**
- Consumes: final skill files.
- Produces: installed skill; final user report.

- [ ] **Step 1: Install**

```bash
mkdir -p ~/.claude/skills/cinematic-scroll-landing/references ~/.claude/skills/cinematic-scroll-landing/scripts
cp SKILL.md ~/.claude/skills/cinematic-scroll-landing/
cp references/*.md ~/.claude/skills/cinematic-scroll-landing/references/
cp scripts/audit_images.py ~/.claude/skills/cinematic-scroll-landing/scripts/
ls -R ~/.claude/skills/cinematic-scroll-landing
```

Expected: 6 files in place.

- [ ] **Step 2: Final commit + report**

```bash
git add -A && git commit -m "Install skill to ~/.claude/skills; project complete

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

Report to the user: live URL, scroll-length budget (~8 viewports), what was enhanced in the skill, screenshots summary, Lighthouse numbers, and that the CTA is intentionally inert (demo).

---

## Plan Self-Review (completed)

1. **Spec coverage:** skill rewrite ✓(T1), book-mode recipe ✓(T2), scaffold/tokens ✓(T3), content+manifest ✓(T4), timeline math incl. z/angles/re-center ✓(T5/T8), static DOM + 12 faces ✓(T6), atmosphere/preloader(failsafe+reduced-motion)/HUD ✓(T7), flips/ribbon/edges/spine/HUD/TOC/hash ✓(T8), a11y/fallbacks ✓(T9 + flat CSS in T3), imagery+QA+audit ✓(T10), verification protocol ✓(T11), deploy+live smoke+Lighthouse ✓(T12), back-port ✓(T13), install ✓(T14). Gaps: none found.
2. **Placeholder scan:** no TBDs; Task 11/13 are inherently discovery tasks — their steps define the *procedure and exit criteria*, which is the deliverable.
3. **Type consistency:** `bookTimeline` exports match usage in T6/T8 (verified name-by-name); `content` exports match T6 imports; `FLAT_QUERY` duplicated in App only; `Img.src` regex matches manifest paths; `inert` boolean prop is React-19-valid.
