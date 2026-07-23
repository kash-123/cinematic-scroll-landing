# cinematic-scroll-landing — project guide

Dual-purpose repo: the **cinematic-scroll-landing skill** (dev master at the
repo root: SKILL.md, references/, scripts/) and its living proof, the
**Codex Academy demo** (demo/ — a full-page book-scroll landing page for a
fictional Moodle LMS trial).

## The install rule (the one thing not to forget)

The ACTIVE skill copy is `~/.claude/skills/cinematic-scroll-landing/`.
Editing repo files does nothing until re-copied:

```bash
cp SKILL.md ~/.claude/skills/cinematic-scroll-landing/
cp references/*.md ~/.claude/skills/cinematic-scroll-landing/references/
cp scripts/*.py ~/.claude/skills/cinematic-scroll-landing/scripts/
```

## Demo commands

- In `demo/`: `npm run dev` / `build` / `preview`; `npx vitest run`
  (11 tests: timeline math + content wiring).
- From repo root: `python scripts/audit_images.py demo` (image wiring audit).
- In `demo/`: `node shoot.mjs <url> <outdir>` (screenshot sweep at exact
  timeline units via the `window.__lenis` hook) and
  `node console-check.mjs <url>` (error sweep across the full scroll).

## Deploy

`npx vercel deploy --prod --yes` from `demo/` (CLI already authed; project
`codex-academy`, team `kash12`). Live: https://codex-academy-five.vercel.app
— plain `codex-academy.vercel.app` is SOMEONE ELSE'S site. `.vercel/` stays
gitignored.

## Imagery

Generated via the banana skill's direct-API fallback script with the key at
`~/.banana/api_key.txt`; locked template + generation-ops rules in
`references/imagery-universe.md`. Generator originals land in
`~/Documents/nanobanana_generated/`; only optimized WebP/JPEG (see ship-size
discipline) enter `demo/public/`.

## Policies (this demo deploys publicly)

CTA intentionally inert; no forms or data collection; all institutions,
people, and stats fictional; "Powered by Moodle™" is nominative credit only.

## History

Spec, plan, and retrospective live in `docs/superpowers/`. The original
kimi-3-swarm skill is preserved as the baseline commit.
