// Injects the server-rendered app into dist/index.html. Run after both builds:
//   vite build  →  vite build --ssr src/entry-server.tsx --outDir dist-ssr  →  node scripts/prerender.mjs
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const { render } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href)
const html = readFileSync('dist/index.html', 'utf8')
const marker = '<div id="root"></div>'
if (!html.includes(marker)) throw new Error('prerender: #root marker not found in dist/index.html')
const page = html.replace(marker, `<div id="root">${render()}</div>`)
writeFileSync('dist/index.html', page)
// GitHub Pages serves 404.html for unknown paths: land people on the site (canonical points home)
writeFileSync('dist/404.html', page)
rmSync('dist-ssr', { recursive: true, force: true })
console.log('prerendered dist/index.html')
