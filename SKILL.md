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
