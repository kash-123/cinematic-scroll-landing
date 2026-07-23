# Imagery: One Visual Universe

## Why

Users experience scroll discontinuity as an IMAGE problem first. Mixed
sources (stock + generated + procedural renders) with different materials,
lighting, and grades read as "unrelated images that don't flow together".
The fix is art direction, not animation.

## Locked style template

Pick ONE template per project and append it VERBATIM to every generation
prompt. Proven example (dark institutional/agency):

> "dark cinematic 3D render, obsidian black and brushed gold metallic
> materials, single hard rim light from upper left, volumetric fog, deep
> navy-black background, high contrast, subtle film grain, monochrome with
> warm gold accents, no text, no watermark"

Rules:
- Fix the light direction (upper left), materials (2 max), background, grade.
- Vary only the SUBJECT per image. Subjects should be concrete nouns tied to
  the content item (course → its topic's artifact), never abstract filler.
- Ratios: 2:3 portrait for cards, 16:9 for heroes, 3:2 for chapters.

## Batch QA (mandatory)

1. Build a contact sheet of the whole batch before wiring anything.
2. Reject/regenerate any image that breaks the template (wrong light, wrong
   palette, text artifacts).
3. Crop generator watermarks — e.g. bottom ~5.5% removes typical corner
   marks. All usages should be `object-cover` so crops are safe.

```python
from PIL import Image
im = Image.open('in.png')
w, h = im.size
im.crop((0, 0, w, int(h * 0.945))).save('out.png')
```

## Ship-size discipline

Generators emit print-size assets (2K PNG ≈ 2-3MB each). Before wiring,
resize to ≤2× the largest rendered size and convert to WebP q80-85 (og
image: JPEG for social scrapers). A 10-image batch went 29MB → 676KB with
no visible loss. Keep the originals out of `public/`.

## Wiring discipline

- Every content item gets its OWN images (course → 3 chapter images each).
  Sharing one generic set across items is the "discontinued images" smell.
- Older/legacy imagery you must keep: apply a shared grade overlay so it
  blends in:

```css
.media-grade { position: relative; }
.media-grade::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  box-shadow: inset 0 0 120px rgba(8,11,16,.55);   /* vignette */
  background: rgba(201,164,92,.08);                /* accent tint */
  mix-blend-mode: overlay;
}
```

## Logo/emblem prep from an uploaded image

Threshold non-white pixels → square crop around centroid → circular mask
(4× supersampled ellipse, eroded ~1% to kill background rim) → transparent
PNG (1024 + 64 favicon). Extract the brand palette from the emblem pixels
(gold/navy/flame averages) and use those as design tokens.

## Tooling note

The template is tool-agnostic: use whatever image-generation skill/tool
the session provides (e.g. a Gemini/banana skill). The locked template,
contact-sheet QA, and watermark crop apply identically regardless of tool.

## Generation ops (probe first, then generate)

- ONE structured probe before building any pipeline: is the MCP tool
  present? else does the fallback script + a stored key exist? If no key,
  ask the user immediately — do not go spelunking through configs.
- Validate the key with a FREE metadata call (e.g. GET /models) before the
  first paid generation.
- Free tiers rate-limit hard (~5-15 RPM): pace batch calls (~7s apart) and
  retry transient network drops once before reporting failure.
- Parse the generator's ENTIRE stdout as JSON before declaring failure —
  pretty-printed multi-line JSON defeats line-by-line parsers, and a "failed"
  result that actually succeeded wastes a paid regeneration.
- Decide SHIP formats and sizes at design time (see Ship-size discipline),
  not at deploy time — retrofitting extensions churns manifest, tests, and
  meta tags after verification already ran.
