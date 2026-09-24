// Design tokens: every color, font, easing, timing and layer name lives here.
// styles/base.css mirrors the static values as CSS custom properties (the pre-JS defaults);
// at runtime hooks/useTemperature.ts recomputes the surface colors from the temperature dial.

export const palette = {
  ink: '#07090B', // near-black base
  bone: '#ECE8DF', // bone-white text
  signal: '#C6FF3D', // the one electric accent (high temperature)
  signalInk: '#3F5A00', // the accent on light (low temperature) surfaces
} as const

// Category palette: only for project categories and data marks, never for body text.
// `dark` values sit on the near-black base, `light` values on the paper base; both >= 3:1.
export const categories = {
  ml: { label: 'AI / ML Models', short: 'AI/ML', dark: '#5CA8FF', light: '#1F5FC4' },
  llm: { label: 'LLM Agents & Automation', short: 'LLM', dark: '#FF7AC6', light: '#B8267A' },
  saas: { label: 'SaaS Products', short: 'SaaS', dark: '#FFB547', light: '#9A5B00' },
  quant: { label: 'Quant & Data Systems', short: 'Quant', dark: '#4BE3A5', light: '#0B7A4E' },
  web3: { label: 'Web3', short: 'Web3', dark: '#FF6B4A', light: '#B83A1C' },
  agency: { label: 'Agency & Client Work', short: 'Agency', dark: '#A58BFF', light: '#5B3FC4' },
} as const

export type CategoryId = keyof typeof categories
export const categoryIds = Object.keys(categories) as CategoryId[]

export const fonts = {
  display: "'Instrument Serif', 'Times New Roman', serif",
  body: "'Inter Tight', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace",
} as const

export const ease = {
  // computation: fast out, long precise settle
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  outCss: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOutCss: 'cubic-bezier(0.65, 0, 0.35, 1)',
} as const

export const duration = {
  micro: 0.16,
  fast: 0.28,
  base: 0.55,
  slow: 1.0,
  stagger: 0.04,
  token: 0.018, // seconds per streamed token in readouts
} as const

// Temperature: 0 = crisp paper, 1 = dark and expressive. Below the threshold is the light theme.
export const temperature = {
  default: 0.7,
  threshold: 0.5,
  step: 0.05,
} as const

// The page is one forward pass. Order here is the order on the page.
export const layers = [
  { id: 'top', name: 'INPUT' },
  { id: 'about', name: 'EMBEDDING' },
  { id: 'work', name: 'ATTENTION' },
  { id: 'skills', name: 'LATENT SPACE' },
  { id: 'log', name: 'TRAINING' },
  { id: 'faq', name: 'EVALUATION' },
  { id: 'contact', name: 'OUTPUT' },
] as const

export type LayerId = (typeof layers)[number]['id']

export const layerLabel = (id: LayerId) => {
  const i = layers.findIndex((l) => l.id === id)
  return `LAYER ${String(i + 1).padStart(2, '0')} / ${String(layers.length).padStart(2, '0')} · ${layers[i].name}`
}

export const breakpoints = { sm: 640, md: 900, lg: 1200 } as const

export const z = { grain: 1, hud: 40, header: 50, fab: 55, wipe: 80, cursor: 90, dialog: 100, toast: 110 } as const
