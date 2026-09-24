import { useEffect, useRef } from 'react'
import { PROJECT_SETUPS } from './projectScenes.js'

// Small live illustrations for the services section.
//   scatter   – noisy points with a least-squares line that refits as the data drifts
//   bars      – a dashboard bar chart re-sorting with a moving-average line
//   network   – a feed-forward net with activations travelling layer to layer
//   attention – self-attention weights from one token to the rest of a sentence
//   detect    – a scan line finding objects and drawing bounding boxes
//   anomaly   – a live signal with points outside the expected band flagged
//   forecast  – history plus a forecast with a widening prediction interval
//   pipeline  – model builds moving through CI stages, some failing evaluation
//   stream    – events flowing from producers through partitions into consumers

const rand = (a, b) => a + Math.random() * (b - a)
const lerp = (a, b, t) => a + (b - a) * t
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

function setupScatter() {
  const n = 46
  let slope = rand(-0.5, 0.7)
  const pts = Array.from({ length: n }, () => {
    const x = rand(0.08, 0.92)
    return { x, e: rand(-1, 1) * 0.12, jit: Math.random() * Math.PI * 2 }
  })
  const fit = { m: slope, b: 0.5, tm: slope, tb: 0.5 }
  let last = 0
  return (ctx, w, h, t, col) => {
    if (t - last > 3200) {
      last = t
      slope = rand(-0.6, 0.8)
    }
    const P = pts.map((p) => ({
      x: p.x,
      y: 0.5 + slope * (p.x - 0.5) + p.e + Math.sin(t / 900 + p.jit) * 0.015,
    }))
    // ordinary least squares
    const mx = P.reduce((a, p) => a + p.x, 0) / n
    const my = P.reduce((a, p) => a + p.y, 0) / n
    let sxy = 0
    let sxx = 0
    P.forEach((p) => {
      sxy += (p.x - mx) * (p.y - my)
      sxx += (p.x - mx) ** 2
    })
    fit.tm = sxy / sxx
    fit.tb = my - fit.tm * mx
    fit.m += (fit.tm - fit.m) * 0.04
    fit.b += (fit.tb - fit.b) * 0.04
    const Y = (y) => h - y * h

    // axes
    ctx.strokeStyle = col.rule
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(w * 0.04, h * 0.06)
    ctx.lineTo(w * 0.04, h * 0.94)
    ctx.lineTo(w * 0.96, h * 0.94)
    ctx.stroke()

    // residuals
    ctx.strokeStyle = col.c3
    ctx.globalAlpha = 0.45
    P.forEach((p) => {
      ctx.beginPath()
      ctx.moveTo(p.x * w, Y(p.y))
      ctx.lineTo(p.x * w, Y(fit.m * p.x + fit.b))
      ctx.stroke()
    })
    ctx.globalAlpha = 1

    // band + fit line
    ctx.fillStyle = col.c1
    ctx.globalAlpha = 0.12
    ctx.beginPath()
    ctx.moveTo(0, Y(fit.b + 0.08))
    ctx.lineTo(w, Y(fit.m + fit.b + 0.08))
    ctx.lineTo(w, Y(fit.m + fit.b - 0.08))
    ctx.lineTo(0, Y(fit.b - 0.08))
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.strokeStyle = col.c1
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, Y(fit.b))
    ctx.lineTo(w, Y(fit.m + fit.b))
    ctx.stroke()

    ctx.fillStyle = col.text
    P.forEach((p) => {
      ctx.beginPath()
      ctx.arc(p.x * w, Y(p.y), 2.6, 0, Math.PI * 2)
      ctx.fill()
    })
  }
}

function setupNetwork() {
  const layers = [3, 5, 5, 4, 2]
  const nodes = layers.map((count, li) =>
    Array.from({ length: count }, (_, i) => ({
      x: 0.1 + (li / (layers.length - 1)) * 0.8,
      y: (i + 1) / (count + 1),
      a: 0,
    })),
  )
  const weights = nodes.slice(0, -1).map((layer, li) =>
    layer.map(() => nodes[li + 1].map(() => rand(-1, 1))),
  )
  const PERIOD = 2600
  return (ctx, w, h, t, col) => {
    const phase = (t % PERIOD) / PERIOD // one forward pass per period
    const front = phase * (layers.length - 1)

    // edges, lit as the activation front passes over them
    weights.forEach((layer, li) =>
      layer.forEach((row, i) =>
        row.forEach((wt, j) => {
          const a = nodes[li][i]
          const b = nodes[li + 1][j]
          const local = front - li
          ctx.strokeStyle = wt > 0 ? col.c2 : col.c3
          ctx.globalAlpha = 0.08 + Math.abs(wt) * 0.18
          ctx.lineWidth = 0.6 + Math.abs(wt) * 1.2
          ctx.beginPath()
          ctx.moveTo(a.x * w, a.y * h)
          ctx.lineTo(b.x * w, b.y * h)
          ctx.stroke()
          if (local > 0 && local < 1 && Math.abs(wt) > 0.35) {
            ctx.globalAlpha = 1
            ctx.fillStyle = wt > 0 ? col.c2 : col.c3
            ctx.beginPath()
            ctx.arc((a.x + (b.x - a.x) * local) * w, (a.y + (b.y - a.y) * local) * h, 2.2, 0, Math.PI * 2)
            ctx.fill()
          }
        }),
      ),
    )
    ctx.globalAlpha = 1

    nodes.forEach((layer, li) =>
      layer.forEach((n) => {
        const d = front - li
        const target = d >= 0 && d < 1.2 ? 1 : 0
        n.a += (target - n.a) * 0.12
        ctx.fillStyle = col.bg
        ctx.strokeStyle = col.muted
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(n.x * w, n.y * h, 7, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        if (n.a > 0.02) {
          ctx.globalAlpha = n.a
          ctx.fillStyle = col.c1
          ctx.beginPath()
          ctx.arc(n.x * w, n.y * h, 7, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
        }
      }),
    )
  }
}

const label = (ctx, col, size = 11) => {
  ctx.font = `${size}px "JetBrains Mono", ui-monospace, monospace`
  ctx.fillStyle = col.muted
}

function setupBars() {
  const n = 9
  let target = Array.from({ length: n }, () => rand(0.2, 0.9))
  const vals = target.map(() => 0.05)
  let last = null
  return (ctx, w, h, t, col) => {
    if (last === null) last = t
    if (t - last > 2200) {
      last = t
      target = target.map((v) => Math.min(0.95, Math.max(0.12, v + rand(-0.3, 0.3))))
    }
    vals.forEach((v, i) => (vals[i] = v + (target[i] - v) * 0.05))
    const pad = w * 0.06
    const base = h * 0.88
    const bw = (w - pad * 2) / n
    const top = Math.max(...vals)
    vals.forEach((v, i) => {
      ctx.fillStyle = v === top ? col.c1 : col.c2
      ctx.globalAlpha = v === top ? 1 : 0.75
      ctx.fillRect(pad + i * bw + bw * 0.18, base - v * h * 0.72, bw * 0.64, v * h * 0.72)
    })
    ctx.globalAlpha = 1
    // 3-point moving average
    ctx.strokeStyle = col.c3
    ctx.lineWidth = 2
    ctx.beginPath()
    vals.forEach((_, i) => {
      const win = vals.slice(Math.max(0, i - 1), i + 2)
      const avg = win.reduce((a, b) => a + b, 0) / win.length
      const x = pad + i * bw + bw / 2
      const y = base - avg * h * 0.72
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
    })
    ctx.stroke()
    ctx.strokeStyle = col.rule
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(pad, base + 0.5)
    ctx.lineTo(w - pad, base + 0.5)
    ctx.stroke()
  }
}

function setupAttention() {
  const tokens = ['what', 'does', 'the', 'report', 'say']
  const PERIOD = 1800
  const weights = tokens.map(() => 0)
  let focus = -1
  let target = weights.slice()
  return (ctx, w, h, t, col) => {
    const f = Math.floor(t / PERIOD) % tokens.length
    if (f !== focus) {
      focus = f
      const raw = tokens.map((_, i) => (i === f ? 0 : Math.exp(rand(-1, 2))))
      const sum = raw.reduce((a, b) => a + b, 0)
      target = raw.map((r) => r / sum)
    }
    weights.forEach((v, i) => (weights[i] = v + (target[i] - v) * 0.08))
    const y = h * 0.78
    const xs = tokens.map((_, i) => w * (0.1 + (i / (tokens.length - 1)) * 0.8))
    const fx = xs[focus]
    xs.forEach((x, i) => {
      if (i === focus) return
      const wt = weights[i]
      ctx.strokeStyle = col.c2
      ctx.globalAlpha = 0.2 + wt * 0.8
      ctx.lineWidth = 1 + wt * 9
      ctx.beginPath()
      ctx.moveTo(fx, y - 16)
      ctx.quadraticCurveTo((fx + x) / 2, y - 16 - Math.abs(x - fx) * 0.55, x, y - 16)
      ctx.stroke()
      ctx.globalAlpha = 1
      label(ctx, col, 10)
      ctx.textAlign = 'center'
      ctx.fillText(wt.toFixed(2), x, y + 20)
    })
    ctx.globalAlpha = 1
    ctx.textAlign = 'center'
    ctx.font = `600 ${Math.min(15, w / 22)}px "Bricolage Grotesque", system-ui, sans-serif`
    tokens.forEach((tok, i) => {
      ctx.fillStyle = i === focus ? col.c1 : col.text
      ctx.fillText(tok, xs[i], y)
    })
    ctx.textAlign = 'left'
  }
}

function setupDetect() {
  const CYCLE = 4200
  const names = ['circle', 'box', 'triangle']
  let objs = null
  let cycle = -1
  const make = () =>
    names.map((name, i) => ({
      name,
      x: 0.12 + i * 0.29 + rand(0, 0.08),
      y: rand(0.3, 0.62),
      s: rand(0.1, 0.15),
      conf: rand(0.86, 0.98),
    }))
  return (ctx, w, h, t, col) => {
    const c = Math.floor(t / CYCLE)
    if (c !== cycle) {
      cycle = c
      objs = make()
    }
    const p = (t % CYCLE) / CYCLE
    const scan = Math.min(1, p / 0.6)
    const s = Math.min(w, h * 1.6)
    // pixel-grid backdrop
    ctx.fillStyle = col.rule
    for (let gx = 8; gx < w; gx += 14) for (let gy = 8; gy < h; gy += 14) ctx.fillRect(gx, gy, 1.5, 1.5)
    const pal = [col.c1, col.c2, col.c3]
    objs.forEach((o, i) => {
      const x = o.x * w
      const y = o.y * h
      const r = o.s * s * 0.5
      ctx.fillStyle = col.muted
      ctx.globalAlpha = 0.55
      ctx.beginPath()
      if (o.name === 'circle') ctx.arc(x, y, r, 0, Math.PI * 2)
      else if (o.name === 'box') ctx.rect(x - r, y - r, r * 2, r * 2)
      else {
        ctx.moveTo(x, y - r)
        ctx.lineTo(x + r, y + r)
        ctx.lineTo(x - r, y + r)
      }
      ctx.fill()
      ctx.globalAlpha = 1
      if (scan * w > x + r) {
        ctx.strokeStyle = pal[i]
        ctx.lineWidth = 2
        ctx.strokeRect(x - r - 5, y - r - 5, r * 2 + 10, r * 2 + 10)
        ctx.font = '600 11px "Bricolage Grotesque", system-ui, sans-serif'
        const text = `${o.name} ${o.conf.toFixed(2)}`
        const tw = ctx.measureText(text).width + 8
        ctx.fillStyle = pal[i]
        ctx.fillRect(x - r - 6, y - r - 22, tw, 17)
        ctx.fillStyle = col.bg
        ctx.fillText(text, x - r - 2, y - r - 9)
      }
    })
    if (p < 0.6) {
      ctx.strokeStyle = col.c2
      ctx.globalAlpha = 0.8
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(scan * w, 0)
      ctx.lineTo(scan * w, h)
      ctx.stroke()
      ctx.globalAlpha = 1
    }
  }
}

function setupAnomaly() {
  const N = 110
  const buf = []
  let k = 0
  let last = null
  const sample = () => {
    k++
    const v = 0.5 + Math.sin(k / 9) * 0.1 + Math.sin(k / 3.3) * 0.03 + rand(-0.03, 0.03)
    return Math.random() < 0.035 ? v + (Math.random() < 0.5 ? -1 : 1) * rand(0.22, 0.32) : v
  }
  for (let i = 0; i < N; i++) buf.push(sample())
  return (ctx, w, h, t, col) => {
    if (last === null) last = t
    while (t - last > 60) {
      last += 60
      buf.shift()
      buf.push(sample())
    }
    const X = (i) => (i / (N - 1)) * w
    const Y = (v) => h - v * h
    const expected = (i) => 0.5 + Math.sin((k - N + 1 + i) / 9) * 0.1
    // expected band
    ctx.fillStyle = col.c2
    ctx.globalAlpha = 0.14
    ctx.beginPath()
    for (let i = 0; i < N; i++) ctx.lineTo(X(i), Y(expected(i) + 0.12))
    for (let i = N - 1; i >= 0; i--) ctx.lineTo(X(i), Y(expected(i) - 0.12))
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.strokeStyle = col.text
    ctx.lineWidth = 1.4
    ctx.beginPath()
    buf.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))))
    ctx.stroke()
    let flagged = 0
    buf.forEach((v, i) => {
      if (Math.abs(v - expected(i)) <= 0.12) return
      flagged++
      ctx.fillStyle = col.c3
      ctx.strokeStyle = col.c3
      ctx.beginPath()
      ctx.arc(X(i), Y(v), 3.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(X(i), Y(v), 9, 0, Math.PI * 2)
      ctx.stroke()
    })
    label(ctx, col)
    ctx.fillText(`${flagged} flagged in window`, 10, 18)
  }
}

function setupForecast() {
  const HIST = 60
  const HORIZON = 24
  const CYCLE = 6000
  let series = null
  let cycle = -1
  const make = () => {
    const trend = rand(-0.002, 0.004)
    const amp = rand(0.06, 0.12)
    return Array.from({ length: HIST + HORIZON }, (_, i) => 0.42 + i * trend + Math.sin(i / 4) * amp + rand(-0.03, 0.03))
  }
  return (ctx, w, h, t, col) => {
    const c = Math.floor(t / CYCLE)
    if (c !== cycle) {
      cycle = c
      series = make()
    }
    const p = (t % CYCLE) / CYCLE
    const total = HIST + HORIZON
    const X = (i) => w * 0.04 + (i / (total - 1)) * w * 0.92
    const Y = (v) => h - v * h
    const histN = Math.round(Math.min(1, p / 0.35) * HIST)
    const fcN = p < 0.35 ? 0 : Math.round(Math.min(1, (p - 0.35) / 0.35) * HORIZON)
    // interval widens with the horizon
    if (fcN > 0) {
      ctx.fillStyle = col.c1
      ctx.globalAlpha = 0.16
      ctx.beginPath()
      for (let i = 0; i <= fcN; i++) ctx.lineTo(X(HIST - 1 + i), Y(series[HIST - 1 + i] + 0.02 + i * 0.006))
      for (let i = fcN; i >= 0; i--) ctx.lineTo(X(HIST - 1 + i), Y(series[HIST - 1 + i] - 0.02 - i * 0.006))
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.strokeStyle = col.c1
      ctx.lineWidth = 2
      ctx.setLineDash([5, 4])
      ctx.beginPath()
      for (let i = 0; i <= fcN; i++) ctx.lineTo(X(HIST - 1 + i), Y(series[HIST - 1 + i]))
      ctx.stroke()
      ctx.setLineDash([])
    }
    ctx.strokeStyle = col.text
    ctx.lineWidth = 1.6
    ctx.beginPath()
    for (let i = 0; i < histN; i++) ctx.lineTo(X(i), Y(series[i]))
    ctx.stroke()
    if (histN === HIST) {
      ctx.strokeStyle = col.rule
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(X(HIST - 1), h * 0.08)
      ctx.lineTo(X(HIST - 1), h * 0.94)
      ctx.stroke()
      label(ctx, col)
      ctx.fillText('now', X(HIST - 1) + 5, h * 0.08 + 10)
    }
  }
}

function setupPipeline() {
  const stages = ['data', 'train', 'evaluate', 'registry', 'deploy']
  const packets = []
  let lastSpawn = null
  let version = 12
  const TRAVEL = 3600
  return (ctx, w, h, t, col) => {
    if (lastSpawn === null) lastSpawn = t - 1000
    if (t - lastSpawn > 1000) {
      lastSpawn = t
      packets.push({ born: t, fail: Math.random() < 0.25, dead: false })
    }
    const xs = stages.map((_, i) => w * (0.1 + (i / (stages.length - 1)) * 0.8))
    const y = h * 0.48
    ctx.strokeStyle = col.rule
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(xs[0], y)
    ctx.lineTo(xs[xs.length - 1], y)
    ctx.stroke()
    const evalX = xs[2]
    for (let i = packets.length - 1; i >= 0; i--) {
      const pk = packets[i]
      const u = (t - pk.born) / TRAVEL
      let x = lerp(xs[0], xs[xs.length - 1], Math.min(1, u))
      let py = y
      let alpha = 1
      if (pk.fail && x >= evalX) {
        // rejected at evaluation: drops out of the pipeline
        const over = (x - evalX) / (xs[4] - evalX)
        x = evalX
        py = y + over * h * 0.9
        alpha = 1 - over * 2
      }
      if (u >= 1 && !pk.dead) {
        pk.dead = true
        if (!pk.fail) version++
      }
      if (u >= 1 || alpha <= 0) {
        packets.splice(i, 1)
        continue
      }
      ctx.globalAlpha = Math.max(0, alpha)
      ctx.fillStyle = pk.fail && x >= evalX ? col.c3 : col.c1
      ctx.beginPath()
      ctx.arc(x, py, 4.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    ctx.textAlign = 'center'
    xs.forEach((x, i) => {
      ctx.fillStyle = col.bg
      ctx.strokeStyle = i === 4 ? col.c2 : col.muted
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, 11, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      label(ctx, col, Math.min(11, w / 30))
      ctx.fillText(stages[i], x, y + 28)
    })
    ctx.textAlign = 'left'
    label(ctx, col)
    ctx.fillStyle = col.c2
    ctx.fillText(`model v1.${version} live`, 10, 18)
  }
}

function setupStream() {
  const lanes = 4
  const parts = []
  let lastSpawn = null
  let arrivals = []
  const TRAVEL = 2600
  return (ctx, w, h, t, col) => {
    if (lastSpawn === null) lastSpawn = t
    while (t - lastSpawn > 70) {
      lastSpawn += 70
      parts.push({ born: lastSpawn, src: Math.floor(Math.random() * 3), lane: Math.floor(Math.random() * lanes) })
    }
    const srcY = (i) => h * (0.25 + i * 0.25)
    const laneY = (i) => h * (0.2 + (i / (lanes - 1)) * 0.6)
    const x0 = w * 0.06
    const x1 = w * 0.3
    const x2 = w * 0.72
    const x3 = w * 0.92
    ctx.strokeStyle = col.rule
    ctx.lineWidth = 6
    ctx.lineCap = 'round'
    for (let l = 0; l < lanes; l++) {
      ctx.beginPath()
      ctx.moveTo(x1, laneY(l))
      ctx.lineTo(x2, laneY(l))
      ctx.stroke()
    }
    ctx.lineCap = 'butt'
    const pal = [col.c1, col.c2, col.c3]
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]
      const u = (t - p.born) / TRAVEL
      if (u >= 1) {
        arrivals.push(t)
        parts.splice(i, 1)
        continue
      }
      let x
      let y
      if (u < 0.25) {
        const k = u / 0.25
        x = lerp(x0, x1, k)
        y = lerp(srcY(p.src), laneY(p.lane), ease(k))
      } else if (u < 0.8) {
        x = lerp(x1, x2, (u - 0.25) / 0.55)
        y = laneY(p.lane)
      } else {
        const k = (u - 0.8) / 0.2
        x = lerp(x2, x3, k)
        y = lerp(laneY(p.lane), h * 0.5, ease(k))
      }
      ctx.fillStyle = pal[p.src]
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3)
    }
    ctx.fillStyle = col.bg
    ctx.strokeStyle = col.c2
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x3, h * 0.5, 12, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    arrivals = arrivals.filter((a) => t - a < 1000)
    label(ctx, col)
    ctx.textAlign = 'right'
    ctx.fillText(`${arrivals.length} events/s`, w - 10, 18)
    ctx.textAlign = 'left'
    for (let l = 0; l < lanes; l++) ctx.fillText(`p${l}`, x2 + 8, laneY(l) + 4)
  }
}

const SETUPS = {
  scatter: setupScatter,
  bars: setupBars,
  network: setupNetwork,
  attention: setupAttention,
  detect: setupDetect,
  anomaly: setupAnomaly,
  forecast: setupForecast,
  pipeline: setupPipeline,
  stream: setupStream,
  ...PROJECT_SETUPS,
}

export default function ServiceCanvas({ kind, theme, className = 'service-canvas' }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const css = getComputedStyle(document.documentElement)
    const v = (n) => css.getPropertyValue(n).trim()
    const col = { c1: v('--c1'), c2: v('--c2'), c3: v('--c3'), text: v('--text'), muted: v('--muted'), rule: v('--rule'), bg: v('--surface') }
    const render = SETUPS[kind]()
    let w = 0
    let h = 0
    let raf = 0
    let visible = false

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const frame = (t) => {
      ctx.clearRect(0, 0, w, h)
      render(ctx, w, h, t, col)
      if (visible && !reduce) raf = requestAnimationFrame(frame)
    }
    // reduced motion: draw a single, representative still frame
    const still = () => {
      render(ctx, w, h, 0, col) // first call starts each animation's clock
      ctx.clearRect(0, 0, w, h)
      render(ctx, w, h, 3100, col)
    }

    size()
    if (reduce) still()
    else frame(performance.now())

    // only animate while on screen
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      cancelAnimationFrame(raf)
      if (visible && !reduce) raf = requestAnimationFrame(frame)
    })
    io.observe(canvas)
    const onResize = () => {
      size()
      if (reduce) still()
    }
    window.addEventListener('resize', onResize)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [kind, theme])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
