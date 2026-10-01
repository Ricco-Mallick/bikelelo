// GitHub Pages serves static files only, so always emit 404.html (SPA deep
// links) and .nojekyll. With SINGLE_FILE=1, also inline the built JS/CSS/favicon
// into index.html so the whole app is one uploadable file.
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const index = resolve(dist, 'index.html')

if (!existsSync(index)) {
  console.error('postbuild: dist/index.html not found — run vite build first')
  process.exit(1)
}

const localPath = (url) => resolve(dist, url.replace(/^(?:\.\/|\/)+/, ''))
const escapeForScript = (code) => code.replace(/<\/script/gi, '<\\/script')

if (process.env.SINGLE_FILE === '1') {
  let html = readFileSync(index, 'utf8')

  html = html.replace(/<link[^>]*rel="stylesheet"[^>]*>/gi, (tag) => {
    const href = /href="([^"]+)"/.exec(tag)?.[1]
    if (!href) return tag
    const file = localPath(href)
    return existsSync(file) ? `<style>${readFileSync(file, 'utf8')}</style>` : tag
  })

  html = html.replace(/<script[^>]*type="module"[^>]*><\/script>/gi, (tag) => {
    const src = /src="([^"]+)"/.exec(tag)?.[1]
    if (!src) return tag
    const file = localPath(src)
    return existsSync(file) ? `<script type="module">${escapeForScript(readFileSync(file, 'utf8'))}</script>` : tag
  })

  html = html.replace(/<link[^>]*rel="(?:modulepreload|icon)"[^>]*>/gi, '')

  const favicon = resolve(dist, 'favicon.svg')
  if (existsSync(favicon)) {
    const data = `data:image/svg+xml;base64,${Buffer.from(readFileSync(favicon)).toString('base64')}`
    html = html.replace('</head>', `  <link rel="icon" type="image/svg+xml" href="${data}">\n  </head>`)
  }

  writeFileSync(index, html)
  console.log(`postbuild: inlined assets into index.html (${(html.length / 1024).toFixed(0)} kB, self-contained)`)
}

copyFileSync(index, resolve(dist, '404.html'))
writeFileSync(resolve(dist, '.nojekyll'), '')
console.log('postbuild: wrote dist/404.html and dist/.nojekyll')
