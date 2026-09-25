// Hero network: Canvas 2D, procedural, no dependencies. Loaded with a dynamic import after first
// paint so the name stays the LCP element. Particles start as noise and self-assemble into a
// layered network; the pointer is the input signal and activations ripple layer by layer toward it.
import { getDeviceTier } from '../../hooks/useDeviceTier'
import { pointer } from '../../hooks/useCursor'
import { getTemperature } from '../../hooks/useTemperature'

type Opts = {
  canvas: HTMLCanvasElement
  host: HTMLElement
  reduce: boolean
  onReadout: (r: { x: number; y: number; act: number; ms: number; pulses: number }) => void
}

type Node = { x: number; y: number; layer: number; a: number; target: number }
type Edge = { from: number; to: number; w: number; flow: number }
type Particle = { sx: number; sy: number; tx: number; ty: number; delay: number; seed: number; kind: 0 | 1 }
type Pulse = { edge: number; t: number; speed: number }

function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
}

const easeOut = (x: number) => 1 - Math.pow(1 - x, 4)

export function startNetwork({ canvas, host, reduce, onReadout }: Opts) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const tier = getDeviceTier()
  const frameMs = 1000 / tier.fps
  const rand = rng(7)

  let w = 0
  let h = 0
  let dpr = 1
  let nodes: Node[] = []
  let edges: Edge[] = []
  let particles: Particle[] = []
  let byLayer: number[][] = []
  let pulses: Pulse[] = []
  const BUCKETS = 10
  const buckets: Edge[][] = Array.from({ length: BUCKETS }, () => [])
  let fg = '#ECE8DF'
  let accent = '#C6FF3D'

  const readColors = () => {
    const cs = getComputedStyle(document.documentElement)
    fg = cs.getPropertyValue('--fg').trim() || fg
    accent = cs.getPropertyValue('--accent').trim() || accent
  }

  const build = () => {
    const mobile = w < 760
    const sizes = mobile ? [3, 5, 6, 5, 3] : [4, 7, 10, 10, 7, 3]
    // desktop: the network sits in the right two-thirds; mobile: full width behind the copy
    // desktop: kept clear of the name (left) and the outputs row (bottom)
    const x0 = mobile ? w * 0.08 : w * 0.53
    const x1 = mobile ? w * 0.92 : w * 0.96
    const y0 = h * (mobile ? 0.14 : 0.15)
    const y1 = h * (mobile ? 0.5 : 0.64)
    nodes = []
    byLayer = []
    sizes.forEach((n, l) => {
      byLayer[l] = []
      const x = x0 + ((x1 - x0) * l) / (sizes.length - 1)
      for (let i = 0; i < n; i++) {
        const y = n === 1 ? (y0 + y1) / 2 : y0 + ((y1 - y0) * (i + 0.5)) / n + (rand() - 0.5) * 8
        byLayer[l].push(nodes.length)
        nodes.push({ x, y, layer: l, a: 0, target: 0 })
      }
    })
    edges = []
    for (let l = 0; l < byLayer.length - 1; l++)
      for (const a of byLayer[l]) for (const b of byLayer[l + 1]) edges.push({ from: a, to: b, w: rand() * 2 - 1, flow: 0 })

    const count = tier.low ? 240 : mobile ? 360 : 760
    particles = []
    for (let i = 0; i < count; i++) {
      const onNode = rand() < 0.42
      let tx: number
      let ty: number
      if (onNode) {
        const n = nodes[(rand() * nodes.length) | 0]
        const r = rand() * 4
        const th = rand() * Math.PI * 2
        tx = n.x + Math.cos(th) * r
        ty = n.y + Math.sin(th) * r
      } else {
        const e = edges[(rand() * edges.length) | 0]
        const t = rand()
        tx = nodes[e.from].x + (nodes[e.to].x - nodes[e.from].x) * t
        ty = nodes[e.from].y + (nodes[e.to].y - nodes[e.from].y) * t
      }
      particles.push({ sx: rand() * w, sy: rand() * h, tx, ty, delay: rand() * 650, seed: rand() * 1000, kind: onNode ? 0 : 1 })
    }
  }

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, tier.low ? 1 : 1.5)
    w = canvas.clientWidth
    h = canvas.clientHeight
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    build()
  }

  // touch: the input signal follows scroll through the hero and device tilt
  let tiltX = 0
  let tiltY = 0
  const onTilt = (e: DeviceOrientationEvent) => {
    if (e.gamma != null) tiltX = Math.max(-1, Math.min(1, e.gamma / 35))
    if (e.beta != null) tiltY = Math.max(-1, Math.min(1, (e.beta - 45) / 35))
  }
  if (tier.touch) window.addEventListener('deviceorientation', onTilt)

  const t0 = performance.now()
  let last = 0
  let lastReadout = 0
  let ix = 0
  let iy = 0

  const draw = (now: number) => {
    const t = reduce ? 1e6 : now - t0
    const temp = getTemperature().t
    const motion = reduce ? 0 : temp
    const r = host.getBoundingClientRect()
    const dt = Math.min(64, now - last || 16)

    // ── input signal ──
    let px: number
    let py: number
    const inside = !tier.touch && pointer.active && pointer.y >= r.top && pointer.y <= r.bottom
    if (inside) {
      px = pointer.x - r.left
      py = pointer.y - r.top
    } else if (tier.touch) {
      const scrollP = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)))
      px = w * (0.5 + tiltX * 0.35)
      py = h * (0.2 + scrollP * 0.6 + tiltY * 0.15)
    } else {
      // idle: a slow Lissajous drift so the network is never dead
      px = w * (0.68 + Math.sin(t / 3100) * 0.22)
      py = h * (0.5 + Math.sin(t / 2300) * 0.3)
    }
    const k = reduce ? 1 : 0.12
    ix += (px - ix) * k
    iy += (py - iy) * k

    const assembled = reduce ? 1 : Math.min(1, t / 1900)

    // ── activations: distance to the signal, mixed with the weighted sum of the previous layer ──
    const sigma = Math.max(160, w * 0.16)
    for (let l = 0; l < byLayer.length; l++) {
      for (const idx of byLayer[l]) {
        const n = nodes[idx]
        const d2 = (n.x - ix) ** 2 + (n.y - iy) ** 2
        const near = Math.exp(-d2 / (2 * sigma * sigma))
        let fwd = 0
        if (l > 0) {
          for (const p of byLayer[l - 1]) fwd += nodes[p].a
          fwd /= byLayer[l - 1].length
        }
        n.target = l === 0 ? 0.25 + near * 0.75 : Math.min(1, near * 0.75 + fwd * 0.45)
        // each layer answers a little later than the one before it: the ripple
        const lag = reduce ? 1 : 0.05 + 0.1 / (1 + l * 0.6)
        n.a += (n.target - n.a) * lag
      }
    }

    // ── pulses travel along edges from active nodes toward active nodes ──
    if (!reduce && assembled > 0.8) {
      const rate = 0.0009 * (0.35 + motion * 1.4) * dt
      for (let i = 0; i < edges.length; i++) {
        const e = edges[i]
        const p = nodes[e.from].a * nodes[e.to].target * (0.4 + Math.abs(e.w) * 0.6) * rate
        if (pulses.length < 160 && Math.random() < p) pulses.push({ edge: i, t: 0, speed: 0.0022 + Math.random() * 0.0016 })
      }
    }
    for (const e of edges) e.flow *= 0.94
    pulses = pulses.filter((p) => {
      p.t += p.speed * dt
      const e = edges[p.edge]
      e.flow = Math.min(1, e.flow + 0.08)
      if (p.t >= 1) {
        nodes[e.to].a = Math.min(1, nodes[e.to].a + 0.12)
        return false
      }
      return true
    })

    // ── render ──
    ctx.clearRect(0, 0, w, h)

    // edges
    ctx.lineWidth = 1
    ctx.strokeStyle = fg
    // edges, batched: one stroke per alpha bucket instead of one per edge
    const edgeAlpha = Math.max(0, (assembled - 0.5) * 2)
    if (edgeAlpha > 0) {
      for (const b of buckets) b.length = 0
      for (const e of edges) {
        const a = nodes[e.from]
        const b = nodes[e.to]
        const alpha = 0.035 + Math.abs(e.w) * 0.04 + e.flow * 0.3 + a.a * b.a * 0.18
        buckets[Math.min(BUCKETS - 1, Math.floor(alpha * BUCKETS * 2))].push(e)
      }
      buckets.forEach((list, i) => {
        if (!list.length) return
        ctx.globalAlpha = edgeAlpha * ((i + 0.5) / (BUCKETS * 2))
        ctx.beginPath()
        for (const e of list) {
          ctx.moveTo(nodes[e.from].x, nodes[e.from].y)
          ctx.lineTo(nodes[e.to].x, nodes[e.to].y)
        }
        ctx.stroke()
      })
    }

    // particles: noise → structure, then a temperature-scaled shimmer. Once assembled, each kind is
    // one path and one fill.
    ctx.fillStyle = fg
    const jitter = 0.2 + motion * 1.6
    const settled = reduce || t > 650 + 1300
    for (const kind of [0, 1] as const) {
      if (settled) {
        ctx.globalAlpha = kind === 0 ? 0.55 : 0.22
        ctx.beginPath()
      }
      for (const p of particles) {
        if (p.kind !== kind) continue
        const q = settled ? 1 : easeOut(Math.min(1, Math.max(0, (t - p.delay) / 1300)))
        let x = p.sx + (p.tx - p.sx) * q
        let y = p.sy + (p.ty - p.sy) * q
        if (!reduce) {
          x += Math.sin(t / 700 + p.seed) * jitter * q
          y += Math.cos(t / 900 + p.seed * 1.3) * jitter * q
        }
        if (settled) ctx.rect(x, y, 1.4, 1.4)
        else {
          ctx.globalAlpha = kind === 0 ? 0.55 : 0.22 + (1 - q) * 0.3
          ctx.fillRect(x, y, 1.4, 1.4)
        }
      }
      if (settled) ctx.fill()
    }

    // nodes
    for (const n of nodes) {
      const rad = 2 + n.a * 4.5
      ctx.globalAlpha = assembled * (0.35 + n.a * 0.65)
      ctx.fillStyle = n.a > 0.55 ? accent : fg
      ctx.beginPath()
      ctx.arc(n.x, n.y, rad, 0, Math.PI * 2)
      ctx.fill()
      if (n.a > 0.62) {
        ctx.globalAlpha = assembled * (n.a - 0.62) * 1.6
        ctx.strokeStyle = accent
        ctx.beginPath()
        ctx.arc(n.x, n.y, rad + 6 + Math.sin(t / 240 + n.x) * motion * 2, 0, Math.PI * 2)
        ctx.stroke()
      }
    }

    // pulses
    ctx.fillStyle = accent
    for (const p of pulses) {
      const e = edges[p.edge]
      const a = nodes[e.from]
      const b = nodes[e.to]
      const x = a.x + (b.x - a.x) * p.t
      const y = a.y + (b.y - a.y) * p.t
      ctx.globalAlpha = 0.9
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3)
      ctx.globalAlpha = 0.25
      ctx.fillRect(x - (b.x - a.x) * 0.04 - 1, y - (b.y - a.y) * 0.04 - 1, 2, 2)
    }
    ctx.globalAlpha = 1

    if (now - lastReadout > 120) {
      lastReadout = now
      const out = byLayer[byLayer.length - 1]
      const act = out.reduce((s, i) => s + nodes[i].a, 0) / out.length
      onReadout({ x: ix / Math.max(1, w), y: 1 - iy / Math.max(1, h), act, ms: dt, pulses: pulses.length })
    }
    last = now
  }

  let raf = 0
  let visible = true
  let prevFrame = 0
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop)
    if (now - prevFrame < frameMs - 1) return
    prevFrame = now
    draw(now)
  }
  const run = () => {
    cancelAnimationFrame(raf)
    if (visible && !reduce && !document.hidden) raf = requestAnimationFrame(loop)
  }

  readColors()
  resize()
  if (reduce) draw(performance.now())
  else run()

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    run()
  })
  io.observe(canvas)
  document.addEventListener('visibilitychange', run)
  const ro = new ResizeObserver(() => {
    resize()
    if (reduce) draw(performance.now())
  })
  ro.observe(canvas)

  return {
    // temperature changed: re-read theme colors (and repaint the static frame under reduced motion)
    retheme: () => {
      readColors()
      if (reduce) draw(performance.now())
    },
    stop: () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', run)
      window.removeEventListener('deviceorientation', onTilt)
    },
  }
}
