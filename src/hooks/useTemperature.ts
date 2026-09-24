import { useSyncExternalStore } from 'react'
import { temperature as T } from '../design/tokens'
import { contrast, ensureContrast, hsl, hslToRgb } from '../lib/color'

// Temperature is the theme. 0.0 is crisp paper: light, minimal, near-static. 1.0 is dark and
// expressive: more grain, more motion. Every surface color is solved at runtime so body text
// stays >= 7:1, muted text >= 4.5:1 and the accent >= 4.5:1 at every setting.

export type Theme = 'light' | 'dark'
export type TempState = { t: number; theme: Theme; vars: Record<string, string> }

const STORAGE_KEY = 'temperature'

export function computeVars(t: number) {
  const dark = t >= T.threshold
  // position inside the current regime, 0 at the threshold end, 1 at the extreme
  const u = dark ? (t - T.threshold) / (1 - T.threshold) : 1 - t / T.threshold
  const dir = dark ? 1 : -1

  const bgH = dark ? 210 : 44
  const bgS = dark ? 18 : 24
  const bgL = dark ? 12 - u * 8.8 : 88 + u * 8.5
  const bg = hslToRgb(bgH, bgS, bgL)

  const fgL = ensureContrast(40, 18, dark ? 86 : 16, bg, 7.5, dir as 1 | -1)
  const mutedL = ensureContrast(40, 6, bgL, bg, 5.0, dir as 1 | -1) // 5.0 on bg keeps >= 4.5 on --surface
  const ruleL = ensureContrast(bgH, 10, bgL, bg, 1.28, dir as 1 | -1)
  const ruleStrongL = ensureContrast(bgH, 10, bgL, bg, 2.0, dir as 1 | -1)
  const accentS = dark ? 100 : 100
  const accentL = ensureContrast(78, accentS, dark ? 62 : 34, bg, 5.0, dir as 1 | -1)
  const surfaceL = bgL + dir * 2.2

  const vars: Record<string, string> = {
    '--bg': hsl(bgH, bgS, bgL),
    '--surface': hsl(bgH, bgS, surfaceL),
    '--fg': hsl(40, 18, fgL),
    '--muted': hsl(40, 6, mutedL),
    '--rule': hsl(bgH, 10, ruleL),
    '--rule-strong': hsl(bgH, 10, ruleStrongL),
    '--accent': hsl(78, accentS, accentL),
    '--on-accent': dark ? '#07090B' : hsl(bgH, bgS, bgL),
    // expression: grain stays under 3%, motion is a 0..1 multiplier read by CSS and canvases
    '--grain': (0.006 + t * 0.022).toFixed(3),
    '--motion': t.toFixed(2),
    '--grid-alpha': (0.18 + t * 0.22).toFixed(2),
  }
  vars['--min-contrast'] = contrast(hslToRgb(40, 6, mutedL), bg).toFixed(2)
  return { theme: (dark ? 'dark' : 'light') as Theme, vars }
}

const clamp = (t: number) => Math.round(Math.max(0, Math.min(1, t)) * 100) / 100

function load(): TempState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (saved && typeof saved.t === 'number') return { t: clamp(saved.t), ...computeVars(clamp(saved.t)) }
  } catch {
    /* storage blocked: use the default */
  }
  return { t: T.default, ...computeVars(T.default) }
}

let state: TempState = load()
const listeners = new Set<() => void>()

function apply(prevTheme: Theme | null) {
  const root = document.documentElement
  const write = () => {
    for (const [k, v] of Object.entries(state.vars)) root.style.setProperty(k, v)
    root.dataset.theme = state.theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', state.vars['--bg'])
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // Crossing the threshold flips light/dark: sweep it in as a data-stream wipe where supported.
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }
  if (prevTheme && prevTheme !== state.theme && doc.startViewTransition && !reduce) {
    root.classList.add('vt-wipe')
    doc.startViewTransition(write).finished.finally(() => root.classList.remove('vt-wipe'))
  } else write()
}

let saveTimer = 0
export function setTemperature(t: number) {
  t = clamp(t)
  if (t === state.t) return
  const prev = state.theme
  state = { t, ...computeVars(t) }
  apply(prev)
  listeners.forEach((l) => l())
  clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ t: state.t, theme: state.theme, vars: state.vars }))
    } catch {
      /* not persisted */
    }
  }, 250)
}

// Called once at boot so the store and the DOM agree (index.html already applied saved vars pre-paint).
export const initTemperature = () => apply(null)
export const getTemperature = () => state

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useTemperature() {
  return useSyncExternalStore(subscribe, getTemperature, getTemperature)
}
