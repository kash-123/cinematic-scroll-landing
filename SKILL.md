---
name: cinematic-scroll-landing
description: >
  Build dark, cinematic, awwwards-style landing pages with seamless scroll
  choreography — endless/infinite scroll loops, pinned image-morph galleries,
  book page-flip feature sections, cross-dissolve scene transitions, unified
  AI-generated imagery, film-slate section markers. Use when the user asks for
  an "endless scroll", "infinite scroll", "seamless scroll", "cinematic",
  "movie-like", "page-flip", "morphing images" landing page, or references
  sites like activetheory.net, or complains that an existing scroll experience
  feels disjointed ("sections don't flow", "images feel unrelated").
  Stack: React 19 + Vite + Tailwind + GSAP ScrollTrigger + Lenis.
---

# Cinematic Scroll Landing Pages

Methodology distilled from a full production build (agency-grade studio site
rebranded into an institutional LMS landing). It produces sites that feel like
one continuous film, not a stack of sections.

## The 6 pillars (all required — skipping any one breaks the illusion)

1. **Research the reference, don't clone the stack.** Award sites (e.g.
   activetheory.net) are usually custom WebGL engines. Decompose the *feel*
   into reproducible mechanics: smooth scroll, parallax, distortion, looping.
   You can get 90% of the feel with Lenis + GSAP + disciplined art direction.

2. **One visual universe.** The #1 cause of "sections feel unrelated" is
   mixed-source imagery. Generate ALL imagery with ONE locked style template
   (see `references/imagery-universe.md`). Never mix stock photos with
   generated art. QA every generated image on a contact sheet and crop
   generator watermarks (bottom ~5.5% is typical).

3. **A shared atmosphere layer.** One `position: fixed` layer behind all
   content (radial gradient + slow-drifting fog/noise + faint logo watermark),
   mounted ONCE at layout level — never per-section, or the infinite loop
   duplicates it. Content floats *through* one continuous world.

4. **Cinematic transitions, not cuts.** Cross-dissolves between scenes
   (~25vh overlap: outgoing opacity→0.3 + scale→0.97 + blur; incoming
   fade-up). Every media reveal uses ONE recipe: clip-path `inset(12%)→0` +
   scale `1.2→1`, bottom-origin, one easing, matched parallax
   (`yPercent -10→10, scrub: 1`) on ALL media site-wide.

5. **Signature scroll set-pieces** (pinned, scrub-driven — recipes in
   `references/motion-recipes.md`):
   - **Endless loop**: Lenis `infinite: true` + duplicate first sections at
     the end; GSAP ticker drives Lenis; LAP counter HUD + progress rail.
   - **Image-morph gallery**: pinned stage; each image dissolves into the
     next (overlapping scale/blur/opacity/clip tweens), synced meta swap.
   - **Flip-book**: pinned stack of 3D pages rotating around a left spine
     (`rotateY 0→-168°`, two-faced pages with `backface`, mid-turn shadow,
     page beneath brightens from 0.55).

6. **Film grammar.** Section labels as slates (`SC.01 / HERO` …), mono
   folios (`PAGE 01 / 06`), gold progress ticks, preloader with 000→100
   counter, custom cursor with contextual labels, film grain overlay.

## Workflow

1. **Teardown** (if a reference URL is given): fetch HTML + screenshots +
   web research; identify engine, type, palette, motion vocabulary. Write
   findings to `info.md`. Conclusion is almost always "custom WebGL — imitate
   the mechanics, not the stack".
2. **Design doc first** (palette ≤3 colors + accent, grotesque type,
   hairlines, zero radius), then implement.
3. **Budget scroll length**: each pinned scene costs viewports
   (morph gallery ≈ items × 100vh, flip-book ≈ pages × 100vh + settle).
   Tell the user the total lap length; keep home ≤ ~25 viewports.
4. **Verify visually** (NON-NEGOTIABLE): serve the build, screenshot at
   multiple scroll depths — hero, mid-morph boundary, mid-flip, scene
   transition, loop wrap. Static builds of cinematic sites ALWAYS have at
   least one bug you can't see in code.
5. **Deep-link test**: hard-load a nested route (`/courses/x`) — see
   Gotchas below.

## Gotchas (each cost us real time — check them all)

- **Vite `base: './'` breaks deep links.** Relative asset URLs 404 the JS
  bundle on hard-load of nested routes → blank page. Use `base: '/'` (or the
  deployment subpath, e.g. `/repo-name/` for GitHub Pages project sites).
- **Pinned sections + infinite loop**: pins must live INSIDE the loop content;
  atmosphere/HUD must be global. Entry dissolve comes free from the scene
  system; outros go inside the pin timeline's tail.
- **GSAP `filter` clobbers Tailwind grayscale**: animate blur on a wrapper
  div, never on the same element as Tailwind filter classes.
- **Generated images ship watermarks**: contact-sheet every batch, crop
  bottom ~5.5%.
- **"Missing images" is often logical, not 404s**: audit data-level wiring
  (per-item image fields), not just file existence. Grep with broad quote
  patterns (single, double, backtick).
- **Mobile + reduced-motion**: unpin everything; stacked fades. Gate with
  `gsap.matchMedia`. Also: no strobing flashes (WCAG 2.3.1 — keep any flash
  < 3/sec), and pinned scenes must not trap keyboard focus.
- **External credentials**: probe capabilities before use (e.g. fine-grained
  GitHub PATs can't create repos — list accessible repos first).
- **Flaky/shared filesystems** (if your env has one): after EVERY git ref
  update immediately `rev-parse` to verify; keep a `/tmp` clone as source of
  truth; never trust an unverified merge.

## Bundled resources

- `references/motion-recipes.md` — copy-paste GSAP/Lenis code: Lenis
  infinite loop, morph gallery timeline, flip-book timeline, cross-dissolve
  system, velocity marquee, preloader.
- `references/imagery-universe.md` — locked style template, per-item prompt
  pattern, contact-sheet QA + watermark crop (Python/PIL).
- `scripts/audit_images.py` — audits src for image refs vs `public/`
  (missing + unused + shared-generic wiring smells).

## Delivery checklist

- [ ] `npm run build` passes
- [ ] Screenshots at ≥5 scroll depths reviewed
- [ ] Deep link hard-loads render (not blank)
- [ ] All imagery passes contact-sheet review (one universe, no watermarks)
- [ ] Reduced-motion + mobile fallbacks present
- [ ] Scroll-length budget reported to user
