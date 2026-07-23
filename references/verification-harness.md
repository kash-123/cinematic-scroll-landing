# Verification Harness (browser screenshots without luck)

How to execute the skill's NON-NEGOTIABLE visual verification when tooling
misbehaves. Order of preference, with immediate pivots — do not retry a
failing provider three times.

## Probe order (one attempt each)

1. **Browser-extension tools** (claude-in-chrome): one `tabs_context` call.
   Not connected → pivot now; launching Chrome rarely fixes it mid-session.
2. **puppeteer-core over CDP** — drives the *installed* Chrome, no browser
   download: `npm i -D puppeteer-core`, `executablePath` to the local
   chrome.exe. This is the workhorse fallback; harness below.
3. Static-only check (no scroll states): headless `--screenshot` — last resort.

Extension quirks: `file://` URLs are refused — serve via
`python -m http.server` from the directory whose relative paths the page
uses. ESM scripts resolve imports from the SCRIPT's directory — put the
harness next to `node_modules`, not in a scratchpad.

## The harness pattern (proven)

Expose the smoother once in app code — `window.__lenis = lenis` — then:

```js
import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
// 'load', NOT networkidle0: keepalive hosts (e.g. Vercel) never go idle
await page.goto(url, { waitUntil: 'load' })
await new Promise(r => setTimeout(r, 3200))            // preloader + settle
for (const u of DEPTH_UNITS) {                          // exact timeline units
  await page.evaluate(({ u, TOTAL }) => {
    const runway = document.querySelector('.runway')
    const max = runway.offsetHeight - innerHeight
    const y = runway.offsetTop + (u / TOTAL) * max
    // force: a stopped Lenis silently ignores scrollTo
    window.__lenis?.scrollTo(y, { immediate: true, force: true }) ?? scrollTo(0, y)
  }, { u, TOTAL })
  await new Promise(r => setTimeout(r, 1600))           // scrub catch-up
  await page.screenshot({ path: `u${u}.png` })
}
```

Variants: `page.emulateMediaFeatures([{name:'prefers-reduced-motion',
value:'reduce'}])` for the flat fallback; 390×844 viewport for mobile; a
console sweep = same loop with `pageerror`/`console`/`requestfailed`
listeners collected and asserted empty.

## Contact sheets without a browser

PIL composite (thumbnail each image into a grid, save one PNG, view that) —
faster and cheaper than a browser for judging an image batch.

## Lighthouse

Keyless PSI API rate-limits (429). Run locally instead:
`CHROME_PATH=<chrome.exe> npx -y lighthouse <url> --chrome-flags="--headless=new"`.
Judge by **observed** FCP/LCP in the JSON, not the simulated score: local
antivirus page-injection (e.g. Kaspersky's 200KB script) and AV file
scanning skew simulated numbers on developer machines.

## Deploys with binary assets

Before reaching for an MCP deploy tool that takes an inline file tree,
probe the authed CLI (`npx vercel whoami`, `gh auth status`): inlining
images as base64 into a tool call can cost hundreds of KB of context.
CLI present + authed → use it; the MCP file-tree path is for text-only apps.
