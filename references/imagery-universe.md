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
