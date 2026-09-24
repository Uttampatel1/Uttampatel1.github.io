// Rough device capability: drives frame caps and point counts for the canvas/3D work.
export type Tier = { low: boolean; fps: 30 | 60; finePointer: boolean; touch: boolean }

let cached: Tier | null = null

export function getDeviceTier(): Tier {
  if (cached) return cached
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency || 4
  const mem = nav.deviceMemory ?? 4
  const low = cores <= 4 || mem <= 2
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  cached = { low, fps: low ? 30 : 60, finePointer, touch: !finePointer }
  return cached
}

export const useDeviceTier = getDeviceTier
