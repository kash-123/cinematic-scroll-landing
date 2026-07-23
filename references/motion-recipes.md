# Motion Recipes (GSAP 3 + Lenis, React 19)

Copy-paste patterns proven in production. All pinned scenes use
`gsap.matchMedia` with a `(max-width: 767px), (prefers-reduced-motion: reduce)`
fallback branch that renders a simple stacked fade-in layout.

## 1. Endless loop (Lenis infinite)

```ts
const lenis = new Lenis({ infinite: true, lerp: 0.09, syncTouch: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```

- Duplicate the FIRST section(s) (hero + marquee) after the footer so the
  wrap is invisible. A `LAP 00N / LOOP ∞` HUD increments on wrap.
- Under `prefers-reduced-motion`, set `infinite: false`.
- Progress rail: compute scene ticks from `[data-section]` element offsets.

## 2. Cross-dissolve scene system (entry)

```ts
// for each [data-scene] section, on entry:
gsap.fromTo(content,
  { opacity: 0, y: 40 },
  { opacity: 1, y: 0, ease: 'none',
    scrollTrigger: { trigger: section, start: 'top 90%', end: 'top 65%', scrub: true } });
// outgoing (non-pinned scenes):
gsap.to(content, { opacity: 0.3, scale: 0.97, filter: 'blur(4px)', ease: 'none',
  scrollTrigger: { trigger: section, start: 'bottom 40%', end: 'bottom 15%', scrub: true } });
// pinned scenes: put the outro INSIDE the pin timeline tail instead.
```

## 3. Pinned image-morph gallery

Structure: pin `+=N*100% + 50%`; N absolutely-stacked images in one stage
frame; ONE scrubbed timeline, N equal segments. Handoff occupies middle 60%
of each boundary:

```ts
// outgoing frame (wrapper div — GSAP filter must not touch Tailwind filters)
tl.to(outWrap, { scale: 1.06, filter: 'blur(6px)', opacity: 0, ease: 'power1.inOut', duration: 0.6 }, at);
// incoming frame — OVERLAPS the outgoing tween (the morph)
tl.fromTo(inWrap, { scale: 1.12, opacity: 0, clipPath: 'inset(6%)' },
  { scale: 1, opacity: 1, clipPath: 'inset(0%)', ease: 'power2.out', duration: 0.6 }, at);
// inner parallax across active window (clamp: first segment's `at - 0.3` goes negative)
tl.fromTo(inImg, { yPercent: -6 }, { yPercent: 6, ease: 'none', duration: 1.6 }, Math.max(0, at - 0.3));
// meta swap lags ~0.1 behind; progress line scaleX 0→1 across all segments
```

- Track active index in `onUpdate` (compare-guarded setState) → stage link
  href + `0N / 08` counter.
- `will-change: transform, opacity` only while a frame is near its segment
  (bitmask pattern), or 8 stacked blurred layers melt GPUs.

## 4. Flip-book (page-turn features)

Structure: pin `+=700%` for 6 pages; `perspective: 1600px` wrapper; pages
absolutely stacked, z-index decreasing; each page = two faces.

```tsx
<div className="page" style={{ transformStyle: 'preserve-3d', transformOrigin: 'left center' }}>
  <div className="front" style={{ backfaceVisibility: 'hidden' }}>…feature content…</div>
  <div className="back"  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
    …darker sheet + faint emblem…
  </div>
  <div className="shadow" /> {/* gradient, opacity driven by flip */}
</div>
```

```ts
// per page i, segment [i, i+1]: flip + settle
// -168° (not -180°): avoids z-fighting at exactly 180° and lets turned pages
// rest visually against the spine like a real book. -178° also works.
tl.to(page, { rotationY: -168, ease: 'power1.inOut', duration: 1.0 }, i);
tl.to(shadow, { opacity: 0.85, duration: 0.5 }, i).to(shadow, { opacity: 0, duration: 0.5 }, i + 0.5);
// page beneath develops like a print
tl.fromTo(next, { filter: 'brightness(0.55)', scale: 0.985 },
  { filter: 'brightness(1)', scale: 1, ease: 'power1.out', duration: 0.7 }, i + 0.3);
// 0.15-unit settle between flips (reading pause)
```

Details that sell it: 3px spine groove + 1px gold hairline at x=0; folio
`PAGE 0N / 06`; 1px gold strip on the turning page's right edge; colophon
sheet under the last page with CTA.

## 5. Velocity-reactive marquee

```ts
let vel = 0;
lenis.on('scroll', ({ velocity }) => (vel = velocity));
gsap.ticker.add(() => {
  skew = gsap.utils.interpolate(skew, gsap.utils.clamp(-8, 8, vel * 0.4), 0.08);
  gsap.set(track, { skewY: skew });
});
// xPercent -50 loop, two copies of the strip, 60s linear
```

## 6. Preloader

Counter 000→100 (1.6s), mono font, logo pulse; exit = two column wipes
(`scaleY 1→0`, stagger 0.08, power4.inOut) revealing the hero's char-split
headline animation (chars `yPercent 110→0`, stagger 0.02, expo.out).
