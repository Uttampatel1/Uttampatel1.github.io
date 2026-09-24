// Pure math for the skill embedding space (no three.js): positions and nearest neighbours, shared
// by the 3D scene and by the accessible list that mirrors it.
import { skillClusters } from '../../data/skills'

export type Point = { key: string; name: string; cluster: string; pos: [number, number, number] }

function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
}

const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r())

// cluster centroids spread on a sphere (golden-angle spiral), members scattered around them
export const centroids: Record<string, [number, number, number]> = {}
export const points: Point[] = []

{
  const r = rng(11)
  const n = skillClusters.length
  skillClusters.forEach((c, i) => {
    const y = 1 - (2 * (i + 0.5)) / n
    const rad = Math.sqrt(1 - y * y)
    const th = i * Math.PI * (3 - Math.sqrt(5))
    const C: [number, number, number] = [Math.cos(th) * rad * 1.9, y * 1.3, Math.sin(th) * rad * 1.9]
    centroids[c.id] = C
    for (const name of c.items) {
      points.push({
        key: `${c.id}:${name}`,
        name,
        cluster: c.id,
        pos: [C[0] + gauss(r) * 0.42, C[1] + gauss(r) * 0.36, C[2] + gauss(r) * 0.42],
      })
    }
  })
}

const d2 = (a: Point, b: Point) => (a.pos[0] - b.pos[0]) ** 2 + (a.pos[1] - b.pos[1]) ** 2 + (a.pos[2] - b.pos[2]) ** 2

// k nearest neighbours by Euclidean distance, with a cosine-ish similarity for the readout
export function neighbours(key: string, k = 4) {
  const p = points.find((q) => q.key === key)
  if (!p) return []
  return points
    .filter((q) => q.key !== key)
    .map((q) => ({ point: q, d: Math.sqrt(d2(p, q)) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k)
    .map(({ point, d }) => ({ point, sim: Math.max(0, 1 - d / 4) }))
}
