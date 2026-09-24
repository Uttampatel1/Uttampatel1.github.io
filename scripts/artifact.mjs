// Turns dist/index.html into a body fragment for hosts that supply their own
// <html>/<head> skeleton (claude.ai Artifacts). Output: dist-artifact/
import { readFileSync, writeFileSync, cpSync, rmSync, mkdirSync } from 'node:fs'

rmSync('dist-artifact', { recursive: true, force: true })
mkdirSync('dist-artifact')
cpSync('dist', 'dist-artifact', { recursive: true })

const html = readFileSync('dist/index.html', 'utf8')
const head = html.match(/<head>([\s\S]*)<\/head>/)[1].replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>/g, '')
const body = html.match(/<body>([\s\S]*)<\/body>/)[1]
writeFileSync('dist-artifact/index.html', `${head.trim()}\n${body.trim()}\n`)
console.log('wrote dist-artifact/index.html')
