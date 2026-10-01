// Screenshot harness using the system Chrome via playwright-core.
// Usage: node scripts/shots.mjs [baseUrl] [outDir]
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const base = process.argv[2] ?? 'http://localhost:4173'
const outDir = resolve(process.argv[3] ?? resolve(dirname(fileURLToPath(import.meta.url)), '../.shots'))
mkdirSync(outDir, { recursive: true })

const TARGETS = [
  { name: 'home-desktop', path: '/', width: 1440, height: 1000 },
  { name: 'browse-desktop', path: '/bikes', width: 1440, height: 1000 },
  { name: 'model-desktop', path: '/bikes/hero-splendor-plus', width: 1440, height: 1000 },
  { name: 'parts-desktop', path: '/parts', width: 1440, height: 1000 },
  { name: 'build-desktop', path: '/build', width: 1440, height: 900 },
  { name: 'garage-desktop', path: '/garage', width: 1440, height: 900 },
  { name: 'home-mobile', path: '/', width: 390, height: 844 },
  { name: 'browse-mobile', path: '/bikes', width: 390, height: 844 },
  { name: 'model-mobile', path: '/bikes/royal-enfield-classic-350', width: 390, height: 844 },
  { name: 'home-tablet', path: '/', width: 834, height: 1112 },
]

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/usr/local/bin/google-chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

const page = await browser.newPage()
const errors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`console: ${msg.text()}`)
})
page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))

for (const target of TARGETS) {
  await page.setViewportSize({ width: target.width, height: target.height })
  await page.goto(`${base}${target.path}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: resolve(outDir, `${target.name}.png`), fullPage: true })
  console.log(`shot ${target.name}`)
}

await browser.close()
console.log(errors.length ? `PAGE ERRORS:\n${errors.join('\n')}` : 'no page errors')
