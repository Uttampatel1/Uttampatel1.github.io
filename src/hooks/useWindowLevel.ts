import { useSyncExternalStore } from 'react'
import { windowLevel as WL } from '../design/tokens'
import { contrast, ensureContrast, hsl, hslToRgb } from '../lib/color'

// The W/L dial is the theme. Level moves brightness (and past the threshold flips the film
// from dark to light, like inverting a radiograph); Window sets how far text sits from the
// background. Every setting is clamped so body text stays >= 7:1 and muted text >= 4.5:1.

export type WLState = { level: number; window: number; film: 'dark' | 'light'; vars: Record<string, string> }

const STORAGE_KEY = 'wl'

export function computeVars(level: number, win: number) {
  const light = level >= WL.filmThreshold
  const t = light ? (level - WL.filmThreshold) / (100 - WL.filmThreshold) : level / WL.filmThreshold
  const k = win / 100
  const dir = light ? -1 : 1

  const bgH = light ? 40 : 210
  const bgS = light ? 20 : 22
  const bgL = light ? 86 + t * 11 : 3.2 + t * 11
  const bg = hslToRgb(bgH, bgS, bgL)

  const fgL = ensureContrast(42, 22, light ? 30 - k * 24 : 72 + k * 22, bg, 7, dir)
  const mutedL = ensureContrast(40, 6, bgL, bg, 4.6 + k * 1.6, dir)
  const ruleL = ensureContrast(bgH, 10, bgL, bg, 1.35 + k * 0.3, dir)
  const ruleStrongL = ensureContrast(bgH, 10, bgL, bg, 2.1 + k * 0.6, dir)
  const accentL = ensureContrast(171, light ? 82 : 72, light ? 34 : 56, bg, 4.6, dir)
  const surfaceL = bgL + dir * (1.6 + k * 1.2)

  const vars: Record<string, string> = {
    '--bg': hsl(bgH, bgS, bgL),
    '--surface': hsl(bgH, bgS, surfaceL),
    '--fg': hsl(42, 22, fgL),
    '--muted': hsl(40, 6, mutedL),
    '--rule': hsl(bgH, 10, ruleL),
    '--rule-strong': hsl(bgH, 10, ruleStrongL),
    '--accent': hsl(171, light ? 82 : 72, accentL),
  }
  // sanity: expose the worst text contrast for the checklist / debugging
  vars['--wl-min-contrast'] = contrast(hslToRgb(40, 6, mutedL), bg).toFixed(2)
  return { film: (light ? 'light' : 'dark') as WLState['film'], vars }
}

function load(): WLState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (saved && typeof saved.level === 'number' && typeof saved.window === 'number') {
      return { level: saved.level, window: saved.window, ...computeVars(saved.level, saved.window) }
    }
  } catch {
    /* storage blocked: fall through to defaults */
  }
  return { level: WL.defaultLevel, window: WL.defaultWindow, ...computeVars(WL.defaultLevel, WL.defaultWindow) }
}

let state: WLState = load()
const listeners = new Set<() => void>()

function apply(prevFilm: WLState['film'] | null) {
  const root = document.documentElement
  const write = () => {
    for (const [k, v] of Object.entries(state.vars)) root.style.setProperty(k, v)
    root.dataset.film = state.film
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', state.vars['--bg'])
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // Crossing the threshold inverts the film: do it as a horizontal scanline wipe where supported.
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }
  if (prevFilm && prevFilm !== state.film && doc.startViewTransition && !reduce) {
    root.classList.add('vt-scan')
    const vt = doc.startViewTransition(write) as { finished: Promise<void> }
    vt.finished.finally(() => root.classList.remove('vt-scan'))
  } else write()
}

let saveTimer = 0
export function setWindowLevel(level: number, win: number) {
  level = Math.max(0, Math.min(100, level))
  win = Math.max(0, Math.min(100, win))
  const prev = state.film
  state = { level, window: win, ...computeVars(level, win) }
  apply(prev)
  listeners.forEach((l) => l())
  clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* not persisted */
    }
  }, 250)
}

export const resetWindowLevel = () => setWindowLevel(WL.defaultLevel, WL.defaultWindow)

// Called once at boot so the store and the DOM agree (the pre-paint script already applied saved vars).
export function initWindowLevel() {
  apply(null)
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const getWindowLevel = () => state

export function useWindowLevel() {
  return useSyncExternalStore(subscribe, getWindowLevel, getWindowLevel)
}

// Radiology-style readout values for the dial.
export const readout = (s: Pick<WLState, 'level' | 'window'>) => ({
  W: Math.round(40 + s.window * 0.8),
  L: Math.round(10 + s.level * 1.6),
})
