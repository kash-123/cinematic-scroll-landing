# Retrospective: Codex Academy build (2026-07-23)

One session: skill enhanced → full-book landing page designed, built, verified,
deployed (https://codex-academy-five.vercel.app) → learnings back-ported and
skill installed. This doc is the process record; distilled rules live in the
skill and the two CLAUDE.md files. It also serves as the RED-phase record for
the skill edits that followed it: every "went wrong" item below is a
documented baseline failure from this session's transcript.

## What went right (keep doing)

1. **Fully-coded plan.** All 14 tasks carried final code, written during
   planning. Execution was mechanical; zero architecture changes during the
   build. The hard thinking happened where it is cheapest.
2. **Spec self-review with implementation eyes** caught 3 design bugs before
   any code existed: cover-open re-centering, z-index choreography (which
   obsoleted the original skill's −168° hack), reduced-motion preloader skip.
3. **Pure-math module + TDD.** Timeline math (units, z, folios, TOC targets)
   in a testable module with 11 tests → zero animation-math bugs at runtime.
4. **The visual verification protocol earned its "NON-NEGOTIABLE" label.**
   4 bugs invisible in code review were found only in screenshots: TOC develop
   overlay never clearing, ribbon striking through the CTA, hash deep-links
   silently ignored, scroll hint pulsing under reduced-motion.
5. **Probe before depending.** API key validated with a free metadata call
   before spending; `gh auth status` + `npx vercel whoami` chose the deploy
   path; PIL availability checked before promising a contact sheet.
6. **Pre-planned fallback chains, all exercised in anger:** banana MCP →
   direct-API script; Chrome extension → puppeteer-core over CDP; Vercel MCP
   (file-tree tool, infeasible for binaries) → authed CLI; PSI API (429) →
   local Lighthouse; file:// (blocked) → http server → PIL composite sheet.
7. **One-universe imagery works as documented.** Locked template: 10/10
   first-pass coherent images; the contact sheet made QA a 30-second judgment.
8. **Primary-evidence debugging.** Lighthouse JSON exposed Kaspersky's 200KB
   page-injection as the "perf problem" (observed FCP/LCP was 2.4s — in
   budget); re-reading a "failed" probe's payload revealed the generation had
   succeeded and only my parser was wrong.
9. **Institutional memory closed the loop.** Original skill preserved as the
   baseline commit; every fix committed with its cause; the build corrected
   the skill (including a real bug in the skill's own audit_images.py:
   nested-path regex + non-recursive listing = false "clean").
10. **Ship-size discipline:** 29MB of 2K PNG → 676KB WebP/JPEG, no visible
    loss.
11. **Design gates with previews.** Four AskUserQuestion gates with ASCII
    previews locked scope/art/brand/engine early; every later decision traced
    back to one of them.

## What went wrong (streamline — each item now has a home)

1. **3 attempts at the Chrome extension before pivoting** (~5 min lost).
   → Probe once, pivot immediately. Now: `references/verification-harness.md`.
2. **Imagery-ops discovery meandered** (env vars → config walk → empty
   project dir) before asking the user for a key.
   → One structured probe, then ask. Now: imagery-universe.md "Generation ops".
3. **False failure from parsing stdout line-by-line** — the generator
   pretty-prints JSON; one duplicate image generated (~$0.13 wasted).
   → Parse whole stdout first. Now: imagery-universe.md + global CLAUDE.md §3.
4. **Ship formats decided mid-deploy** — PNG→WebP churn touched manifest,
   test, and index.html after verification had already run.
   → Decide formats/sizes at design time. Now: SKILL.md workflow + imagery doc.
5. **Loaded the Vercel MCP deploy schema before checking payload
   feasibility** (inlining ~900KB base64 would have burned the context).
   → Probe the authed-CLI path (`whoami`) first for binary-heavy deploys.
   Now: verification-harness.md.
6. **`networkidle0` hung 30s on the live host** (keepalive). → `load` +
   settle sleep. Fixed in Task 13 back-port.
7. **The preloader silently cost ~2.3s of LCP.** Cinematic intent, but it
   must be a conscious knob, not a surprise. Now: SKILL.md costs table.
8. **sed on source files caused two silent test regressions** (unescaped
   regex dot, stale test name). → Structural edits for source; sed for bulk
   mechanical text only. Now: global CLAUDE.md §15.
9. **Plan-staged double-write of Book.tsx** (static in T6, replaced in T8)
   was pure churn under inline execution — that staging pays off only with
   per-task reviewers. Now: global CLAUDE.md §15.
10. **PSI keyless = 429.** Go straight to local Lighthouse with CHROME_PATH.
    Now: verification-harness.md.
11. Background servers killed by port at session end report exit 127 — noise,
    expected; not a failure.

## Numbers

~8 viewports of scroll · 19 commits baseline→install · 11 unit tests ·
10 images ≈ $1.34 · 29MB→676KB assets · Lighthouse a11y 100 / CLS 0 / TBT 0 /
observed FCP-LCP 2.4s · 4 bugs found by screenshots, 0 found after deploy.
