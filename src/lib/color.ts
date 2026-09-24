// Just enough color math to keep every temperature setting at WCAG AA or better.

type RGB = [number, number, number]

export function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0) * 255, f(8) * 255, f(4) * 255]
}

const channel = (c: number) => {
  const v = c / 255
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

export const luminance = ([r, g, b]: RGB) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)

export function contrast(a: RGB, b: RGB) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

export const hsl = (h: number, s: number, l: number) => `hsl(${h} ${s}% ${l.toFixed(1)}%)`

// Walk lightness away from the background until the color reaches `target` contrast.
export function ensureContrast(h: number, s: number, startL: number, bg: RGB, target: number, dir: 1 | -1) {
  let l = startL
  while (contrast(hslToRgb(h, s, l), bg) < target && l > 0 && l < 100) l += dir * 0.5
  return Math.max(0, Math.min(100, l))
}
