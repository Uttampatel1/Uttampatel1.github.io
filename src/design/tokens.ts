// Design tokens: the single place every color, font, easing and timing is named.
// The static CSS custom properties in styles/base.css mirror `film.dark` below and are the
// pre-JS defaults; at runtime useWindowLevel recomputes the surface colors from the W/L dial.

export const palette = {
  base: '#07090B', // near-black scanner room
  bone: '#ECE7DC', // bone-white text
  teal: '#3FE0C5', // the one clinical accent (dark film)
  tealInk: '#0B6F66', // the accent on light film
} as const

// Data palette: only for charts and the skill clusters, never for body text.
// Each color has a dark-film and a light-film value, both >= 3:1 against their background.
export const series = {
  teal: { dark: '#34D1BF', light: '#0E8276' },
  amber: { dark: '#F2A93B', light: '#A45F00' },
  azure: { dark: '#5B9BFF', light: '#2457CC' },
} as const

export type SeriesId = keyof typeof series

export const fonts = {
  display: "'Instrument Serif', 'Times New Roman', serif",
  body: "'Inter Tight', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace",
} as const

export const ease = {
  // "a machine taking a measurement": fast out, long settle
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  outCss: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOutCss: 'cubic-bezier(0.65, 0, 0.35, 1)',
} as const

export const duration = {
  micro: 0.18,
  fast: 0.32,
  base: 0.6,
  slow: 1.1,
  stagger: 0.06,
} as const

export const scan = {
  totalSlices: 128,
  plane: 'AXIAL',
} as const

// Window/level defaults. Level < 50 is dark film, >= 50 flips to light film.
export const windowLevel = {
  defaultLevel: 18,
  defaultWindow: 60,
  filmThreshold: 50,
} as const

export const film = {
  dark: {
    bg: palette.base,
    surface: '#0D1013',
    fg: palette.bone,
    muted: '#9A9A95',
    rule: '#23282C',
    ruleStrong: '#3A4146',
    accent: palette.teal,
  },
} as const

export const breakpoints = { sm: 640, md: 900, lg: 1200 } as const

export const z = { grain: 1, hud: 40, header: 50, wipe: 80, cursor: 90, focus: 95 } as const

export const slice = (n: number) => `SLICE ${String(n).padStart(3, '0')} / ${scan.totalSlices} · ${scan.plane}`
