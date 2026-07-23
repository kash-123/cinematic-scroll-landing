// Console/page-error sweep: scrolls the full runway, reports any errors.
import puppeteer from 'puppeteer-core'

const baseUrl = process.argv[2] ?? 'http://localhost:4173'
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
const problems = []
page.on('pageerror', e => problems.push(`pageerror: ${e.message}`))
page.on('console', m => {
  if (m.type() === 'error' || m.type() === 'warning') problems.push(`${m.type()}: ${m.text()}`)
})
page.on('requestfailed', r => problems.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`))
await page.goto(baseUrl, { waitUntil: 'load' })
await new Promise(r => setTimeout(r, 3500))
for (let f = 0; f <= 1; f += 0.05) {
  await page.evaluate(frac => {
    const runway = document.querySelector('.runway')
    const max = runway.offsetHeight - window.innerHeight
    const lenis = window.__lenis
    const y = runway.offsetTop + frac * max
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true })
    else window.scrollTo(0, y)
  }, f)
  await new Promise(r => setTimeout(r, 120))
}
await new Promise(r => setTimeout(r, 1500))
console.log(problems.length ? problems.join('\n') : 'CONSOLE CLEAN')
await browser.close()
