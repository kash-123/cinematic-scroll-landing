// Screenshot harness: drives installed Chrome via puppeteer-core.
// Usage: node shoot.mjs <baseUrl> <outDir>
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const [baseUrl = 'http://localhost:4173', outDir = 'shots'] = process.argv.slice(2)
mkdirSync(outDir, { recursive: true })

const TOTAL = 7.3
const DEPTHS = [0, 0.5, 1.65, 3.95, 5.2, 7.3]
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--force-device-scale-factor=1', '--hide-scrollbars'],
})

async function newPage(width, height, reducedMotion) {
  const page = await browser.newPage()
  await page.setViewport({ width, height })
  if (reducedMotion) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  return page
}

// --- desktop depth sweep ---
const page = await newPage(1440, 900, false)
await page.goto(baseUrl, { waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 3200)) // preloader + settle
for (const u of DEPTHS) {
  const label = String(u).replace('.', '_')
  await page.evaluate(({ u, TOTAL }) => {
    const runway = document.querySelector('.runway')
    const max = runway.offsetHeight - window.innerHeight
    const y = runway.offsetTop + (u / TOTAL) * max
    const lenis = window.__lenis
    if (lenis) lenis.scrollTo(y, { immediate: true })
    else window.scrollTo(0, y)
  }, { u, TOTAL })
  await new Promise(r => setTimeout(r, 1600)) // scrub catch-up
  await page.screenshot({ path: join(outDir, `desktop-u${label}.png`) })
  console.log(`shot desktop u=${u}`)
}
await page.close()

// --- hash deep link ---
const deep = await newPage(1440, 900, false)
await deep.goto(`${baseUrl}/#ch-2`, { waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 3800))
await deep.screenshot({ path: join(outDir, 'desktop-deeplink-ch2.png') })
console.log('shot deeplink')
await deep.close()

// --- reduced motion (desktop width) ---
const rm = await newPage(1440, 900, true)
await rm.goto(baseUrl, { waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 1200))
await rm.screenshot({ path: join(outDir, 'reduced-motion-top.png') })
await rm.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
await new Promise(r => setTimeout(r, 800))
await rm.screenshot({ path: join(outDir, 'reduced-motion-bottom.png') })
console.log('shot reduced-motion')
await rm.close()

// --- mobile ---
const mob = await newPage(390, 844, false)
await mob.goto(baseUrl, { waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 1200))
await mob.screenshot({ path: join(outDir, 'mobile-top.png') })
await mob.evaluate(() => window.scrollTo(0, 3200))
await new Promise(r => setTimeout(r, 800))
await mob.screenshot({ path: join(outDir, 'mobile-mid.png') })
console.log('shot mobile')
await mob.close()

await browser.close()
console.log('DONE')
