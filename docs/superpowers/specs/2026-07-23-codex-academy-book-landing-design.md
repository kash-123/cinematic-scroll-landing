# Design: The Codex Academy — full-book scroll landing page + skill enhancement

Date: 2026-07-23
Status: approved pending user review of this document

## Goal

Two coupled deliverables:

1. Enhance the `cinematic-scroll-landing` skill (fix gaps found in review) and
   install it to `~/.claude/skills/` so it activates in future sessions.
2. Build and deploy a trial landing page for a Moodle-based LMS where the
   entire page is a book: scrolling turns its pages. Brand: fictional
   **The Codex Academy — powered by Moodle**. Deployed publicly on Vercel.

Success criteria:

- Enhanced skill reads as a menu with honest trade-offs, contains a proven
  full-page book recipe, and is installed where Claude Code loads it.
- Site builds clean, runs at 60fps-ish on a mid laptop, passes the
  verification protocol (screenshots at ≥5 scroll depths, mobile +
  reduced-motion fallbacks, live-URL smoke test), and ends on a working CTA.

## Locked decisions (user-approved)

| Decision | Choice |
|---|---|
| Book metaphor scope | Full book — entire page is one book |
| Art direction | Midnight tome: obsidian leather, gold foil, charcoal parchment pages, ivory ink |
| Brand | Invented: "The Codex Academy — powered by Moodle" (small colophon credit) |
| Engine | One 100vh pinned stage, one master scrubbed GSAP timeline, CSS 3D sheets |
| Deploy | Vercel via connected integration |

## Phase 1 — Skill enhancements

File-level changes (skill files live at repo root; original preserved in git
baseline commit):

### SKILL.md

- Reframe "6 pillars (all required)" → a core system (imagery unity,
  atmosphere layer, one transition grammar, film/book grammar) plus a
  **set-piece menu** with a when-to-use table: endless loop / image-morph
  gallery / flip-book section / full-page book. Include when NOT to use:
  e.g. conversion-focused pages must end on a CTA, so no infinite loop;
  content-dense docs-like pages should not be fully pinned.
- Add a **Costs & trade-offs** subsection: infinite scroll destroys
  scrollbar/footer wayfinding; pinned scenes cost scroll runway and
  keyboard/AT care; stacked blurred layers and unscoped `will-change` melt
  GPUs; every set-piece adds scroll length the user must budget.
- Trim environment-specific gotchas: the flaky-filesystem/git block becomes
  one generalized line ("on unreliable filesystems verify every ref update");
  the GitHub-PAT line generalizes to "probe external credentials before use".
- Extend `description:` triggers with: "book landing page", "page flip
  website", "flipbook site", "book-style scroll".
- Delivery checklist adds: deployed-URL smoke test, og/meta/favicon present,
  quick Lighthouse pass (perf + a11y), fictional-content check (no real
  institutions/people in demo copy).

### references/motion-recipes.md

- New §7 **Full-page book mode** (if it exceeds ~120 lines, promote to
  `references/book-mode.md` and link it): sheet content-mapping model,
  master timeline math, cover-open recipe, ribbon progress, folio math,
  TOC scroll-mapping with hash anchors, fallback strategy. Drafted in
  phase 1 from this design; corrected in phase 3 from build reality.

### references/imagery-universe.md

- One added note: generation tool is whatever image-gen skill is available
  in the session (template stays tool-agnostic).

### scripts/audit_images.py

- No changes (already takes a project root argument; will be run against
  `demo/`).

## Phase 2 — The site

### Stack

React 19 + Vite + TypeScript + Tailwind + GSAP ScrollTrigger + Lenis
(smooth, `infinite: false` — deliberate). No router; hash anchors only.
Fonts self-hosted via @fontsource: Cormorant Garamond (display serif) +
IBM Plex Mono (folios/HUD). Lives in `demo/` in this repo.

### Design tokens

```
--obsidian  #0B0E13   cover leather, void background
--parchment #14181F   page surface
--ink       #E8E3D8   body text (warm ivory)
--gold      #C9A45C   foil, accents, ribbon, CTA
--gold-dim  rgba(201,164,92,.35)  hairlines, ticks
```

Leather and paper textures are procedural (CSS gradients + SVG
feTurbulence noise) — zero image weight, always coherent.

### The paper model (the crux — implement exactly)

A book open at spread k shows left page L_k and right page R_k. Turning the
right page rotates a **sheet** whose front face is R_k and back face is
L_(k+1). 6 spreads → 12 folio pages → 5 sheets + cover board + base page:

- **CoverBoard**: front = leather + gold foil; back = L1 (frontispiece
  endpaper plate). Opens `rotateY 0 → ~-177°` with slight lift. While it
  opens, the whole book block translates +half-a-page-width (closed book
  centered → open spread centered on its spine); same tween, same ease.
- **Sheet k (k=1..5)**: front = R_k, back = L_(k+1). Flips
  `rotateY 0 → rest angle`. Z-index is choreographed, not static:
  unflipped sheet k has `z = N − k` (right-stack order); at flip start it
  bumps to `z = N + k`, so it passes above every already-flipped sheet
  and every unflipped one while turning, and left-resting sheets stack
  latest-on-top. (A static z-order cannot do this — sheet k+1 must cross
  above sheet k mid-turn despite starting below it.)
- **Rest angle −178°, staggered.** Because z-order is managed, the
  original skill's `-168°` anti-z-fighting angle is unnecessary; sheets
  rest at −178° (2° keystone — left-page text stays readable). Coplanar
  flicker between resting sheets is prevented by a per-sheet stagger
  (rest at `−178° + k·0.4°`, or ~0.5px translateZ "paper thickness").
  Supersedes the skill's −168° advice when z is choreographed — phase 3
  back-ports this.
- **Base page**: R6 printed on the right-side base (inside back cover, CTA).
- Turning-sheet gradient shadow (opacity up then down); page beneath
  "develops" via a black overlay `opacity 0.45 → 0` (compositing-cheap
  alternative to `filter: brightness` — one animated property, no filter).
- Visible page-edge stack on the right (layered 1px strips) thins as
  spreads are consumed.

### Master timeline math

Units: cover open 1.0 + settle 0.15 + 5 × (flip 1.0 + settle 0.15) +
final CTA emphasis 0.4 ≈ **7.3 units**. Pin runway = 7.3 × ~110vh ≈
**~8 viewports total** (reported to user; budget ceiling 25).

Scroll position of spread k is computable:
`pinStart + (unitsBefore(k) / totalUnits) × runwayPx` — used by TOC links
(`gsap` scrollTo) and hash-anchor deep links (`#ch-1`… on load → jump).
Timeline built by a pure function in `lib/bookTimeline.ts` so the math is
testable without a browser.

### Content map (final copy written at build time; structure fixed)

| Segment | View | Content |
|---|---|---|
| Cover | leather + foil emblem | THE CODEX ACADEMY · "Learning, bound beautifully." · scroll-to-open hint |
| Spread 1 | L: frontispiece plate · R: Table of Contents | TOC entries are the nav (scrollTo): Ch.I The Craft, Ch.II The Catalog, Ch.III The Record, Ch.IV Begin |
| Spread 2 | Ch. I — The Craft | Course builder, assessments/quizzes, gradebook · inkwell illustration |
| Spread 3 | Ch. I cont. | Forums + live classes (BigBlueButton), mobile app, certifications/badges · wax-seal illustration |
| Spread 4 | Ch. II — The Catalog | 4 course cards, 2:3 imagery: Astronomy & Navigation (astrolabe), Mathematics & Logic (compass), Natural Sciences (botanical dome), Rhetoric & Humanities (lyre) |
| Spread 5 | Ch. III — The Record | Stats in mono: 12,000+ learners · 48 institutions · 94% completion (fictional, demo-labeled) + one testimonial as handwritten marginalia, fictional attribution |
| Spread 6 | Ch. IV — Colophon + inside back cover | 30-day trial details (all features, no card required) · small "powered by Moodle™" credit · gold CTA **Begin your trial** |

Book grammar throughout: folios `PAGE 03 — 04 / 12`, running chapter heads,
3px spine groove + 1px gold hairline, gold **ribbon bookmark** that
lengthens with timeline progress (the progress rail, translated), preloader
000→100 (1.6s, failsafe timeout so it can never wedge; resolves instantly
under `prefers-reduced-motion`), fixed atmosphere
layer behind the book (radial candle-glow + drifting fog/noise + film
grain), custom cursor labels only if time allows (stretch, not scope).

### Components (`demo/src/`)

```
App.tsx                 mounts Atmosphere, Preloader, BookHUD, Book
components/Atmosphere   fixed layer: gradient + fog + grain
components/Preloader    counter + column-wipe exit
components/BookHUD      folio counter, ribbon, running head, TOC state
components/Book         stage, pin, cover board, sheets, base page
components/pages/*      CoverFace, TocPage, FeaturePage, CatalogPage,
                        RecordPage, ColophonPage, BackCoverFace
lib/bookTimeline.ts     pure timeline-math builder (unit map, positions)
lib/lenis.ts            Lenis + ScrollTrigger wiring
data/content.ts         ALL copy + image manifest (single source, so
                        scripts/audit_images.py can verify wiring)
```

### Fallbacks and accessibility

- Same DOM in both modes. Book mode: pages absolutely stacked (CSS class).
  Mobile (`max-width: 767px`) and `prefers-reduced-motion`: identical
  content reflows to plain stacked sections, no pin, no 3D — gated by
  `gsap.matchMedia`, which also owns cleanup.
- No flashing > 3/sec (WCAG 2.3.1). Pinned stage must not trap keyboard
  focus; TOC links are real anchors; CTA is a real button/link. Landmarks +
  alt text on all imagery. `aria-hidden` on decorative faces (sheet backs
  mid-flip).
- Text remains real DOM text at all times (selectable, indexable).

### Imagery manifest (banana skill, one locked template)

Template appended verbatim to every prompt: "dark cinematic 3D render,
obsidian black and brushed gold metallic materials, single hard rim light
from upper left, volumetric fog, deep navy-black background, high contrast,
subtle film grain, monochrome with warm gold accents, no text, no watermark"

| id | subject | ratio | used by |
|---|---|---|---|
| frontispiece-emblem | open tome + laurel wreath emblem plate | 1:1 | spread 1 left |
| craft-inkwell | quill + brass inkwell | 3:2 | spread 2 |
| craft-seal | wax seal stamp on documents | 3:2 | spread 3 |
| catalog-astrolabe | brass astrolabe | 2:3 | course card |
| catalog-compass | drafting compass on parchment | 2:3 | course card |
| catalog-botany | botanical specimen in glass dome | 2:3 | course card |
| catalog-lyre | gold lyre | 2:3 | course card |
| record-armillary | armillary sphere | 3:2 | spread 5 |
| colophon-candle | candle + stacked tomes | 3:2 | spread 6 |
| cover-og | closed obsidian book, gold foil, 3/4 shot | 16:9 | og:image only |

QA per skill: contact sheet before wiring, regenerate off-template images,
crop bottom ~5.5% for watermarks, all usages `object-cover`. Favicon is a
simple gold glyph SVG (not generated).

### Meta, SEO, perf

- `index.html`: title, description, og:title/description/image, favicon.
- Vite `base: '/'` (deep-link gotcha #1). Static build, no server code.
- Perf rules: `will-change` only on the flipping sheet ± neighbors; no
  blur filters on page-sized layers (shadow/overlay divs animate opacity
  instead); images `loading="lazy"` except spread 1; target LCP < 2.5s on
  the deployed URL; bundle target < 250KB gzip JS.

### CTA and data handling

CTA "Begin your trial" is a demo-only target (in-page anchor with a small
"demo build" note). **No forms, no data collection** — a fake signup
collecting real emails is off the table. All institutions, people, and
stats in copy are fictional; "powered by Moodle™" is a nominative credit.

### Deploy

Vercel via the connected MCP integration; project name `codex-academy`.
Mechanics resolved at deploy time (tool schema loaded then). Fallback if
MCP deploy fails: Vercel CLI; second fallback GitHub Pages (with `base`
adjusted per gotcha #1). Live URL smoke-tested after deploy.

## Phase 3 — Back-port + install

- Correct the book-mode recipe with what the build actually taught
  (angles, z-fighting, perf choices that changed, new gotchas).
- Add any newly discovered gotchas to SKILL.md.
- Install: copy SKILL.md + references/ + scripts/ (NOT demo/, docs/) to
  `~/.claude/skills/cinematic-scroll-landing/`.
- Final commits at each milestone.

## Verification protocol (phase 2/3 gate)

1. `npm run build` passes; `npm run preview` serves.
2. Chrome screenshots at ≥5 depths: cover, mid-cover-open, mid-flip
   (spread 2→3), catalog spread, final CTA. Review each for broken 3D,
   z-fighting, overflow.
3. Mobile-viewport screenshot + reduced-motion emulation check (stacked
   fallback renders all content).
4. `python scripts/audit_images.py demo` → clean.
5. Deploy → open live URL → re-screenshot cover + one mid-flip + CTA.
6. Hash deep-link hard-load (`/#ch-2`) on the live URL lands on Ch. II.
7. Quick Lighthouse pass on live URL (perf + a11y sanity, not score-chasing).

## Out of scope (YAGNI)

Router/multi-page, real signup or any data collection, audio/page-turn SFX,
WebGL, CMS, i18n, analytics scripts, infinite scroll (deliberately),
blog/docs pages, custom cursor (stretch only if everything else is done).

## Risks

- **CSS 3D perf on mid hardware** → opacity-only shadows, scoped
  will-change, test at spread count early (risk retires at first
  5-depth screenshot pass).
- **Fixed-height pages overflow on short laptops (720p)** → copy authored
  to fit 1280×720; `clamp()` type scale; if a page still overflows, cut
  copy, never inner-scroll a page.
- **Generated imagery drifts off-template** → contact sheet + regenerate
  (budget ~2 regens).
- **Vercel MCP mechanics unknown** → CLI fallback, then GitHub Pages.
