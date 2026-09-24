import { useCallback, useEffect, useRef, useState } from 'react'

const K = 3
const N = 240
const STEP_MS = 900 // pause between k-means iterations
const TWEEN_MS = 600 // how long centroids take to glide to their new position

// Box–Muller normal sample
function gauss() {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

// Blobs are placed in the right-hand area on wide screens so the name stays readable.
function makeData(wide) {
  const blobs = Array.from({ length: 4 }, () => ({
    x: wide ? 0.5 + Math.random() * 0.42 : 0.12 + Math.random() * 0.76,
    y: 0.14 + Math.random() * (wide ? 0.62 : 0.72),
    s: 0.035 + Math.random() * 0.05,
  }))
  return Array.from({ length: N }, () => {
    const b = blobs[Math.floor(Math.random() * blobs.length)]
    return {
      x: Math.min(0.98, Math.max(0.02, b.x + gauss() * b.s)),
      y: Math.min(0.96, Math.max(0.04, b.y + gauss() * b.s)),
      c: -1,
    }
  })
}

// k-means++ seeding
function seed(points) {
  const cs = [points[Math.floor(Math.random() * points.length)]]
  while (cs.length < K) {
    const d = points.map((p) => Math.min(...cs.map((c) => (p.x - c.x) ** 2 + (p.y - c.y) ** 2)))
    let r = Math.random() * d.reduce((a, b) => a + b, 0)
    let i = 0
    while (r > d[i]) r -= d[i++]
    cs.push(points[Math.min(i, points.length - 1)])
  }
  return cs.map((c) => ({ x: c.x, y: c.y, fx: c.x, fy: c.y, tx: c.x, ty: c.y }))
}

// One Lloyd iteration: assign, then compute new means. Returns whether any assignment changed.
function iterate(points, cents) {
  let changed = false
  for (const p of points) {
    let best = 0
    let bd = Infinity
    cents.forEach((c, i) => {
      const d = (p.x - c.tx) ** 2 + (p.y - c.ty) ** 2
      if (d < bd) {
        bd = d
        best = i
      }
    })
    if (p.c !== best) changed = true
    p.c = best
  }
  cents.forEach((c, i) => {
    const mine = points.filter((p) => p.c === i)
    if (!mine.length) return
    c.fx = c.x
    c.fy = c.y
    c.tx = mine.reduce((a, p) => a + p.x, 0) / mine.length
    c.ty = mine.reduce((a, p) => a + p.y, 0) / mine.length
  })
  const inertia = points.reduce((a, p) => a + (p.x - cents[p.c].tx) ** 2 + (p.y - cents[p.c].ty) ** 2, 0)
  return { changed, inertia }
}

const ease = (t) => 1 - (1 - t) ** 3

export default function KMeansCanvas({ theme }) {
  const canvasRef = useRef(null)
  const state = useRef(null)
  const [status, setStatus] = useState({ iter: 0, inertia: null, done: false })
  const [seedId, setSeedId] = useState(0)

  const reset = useCallback(() => {
    const el = canvasRef.current
    const wide = el ? el.clientWidth > 760 : true
    const points = makeData(wide)
    state.current = { points, cents: seed(points), iter: 0, lastStep: 0, tweenStart: 0, done: false }
    setStatus({ iter: 0, inertia: null, done: false })
    setSeedId((n) => n + 1)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const css = getComputedStyle(document.documentElement)
    const palette = ['--c1', '--c2', '--c3'].map((v) => css.getPropertyValue(v).trim())
    const idle = css.getPropertyValue('--muted').trim()
    let raf = 0
    let w = 0
    let h = 0
    const mouse = { x: -1e4, y: -1e4 }
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    const onLeave = () => {
      mouse.x = mouse.y = -1e4
    }
    // points shy away from the cursor; purely visual, the clustering uses true positions
    const R = 110
    const shown = (p) => {
      p.dx = p.dx || 0
      p.dy = p.dy || 0
      const px = p.x * w
      const py = p.y * h
      const d = Math.hypot(px - mouse.x, py - mouse.y)
      let tx = 0
      let ty = 0
      if (d < R && d > 0.1) {
        const f = (1 - d / R) ** 2 * 34
        tx = ((px - mouse.x) / d) * f
        ty = ((py - mouse.y) / d) * f
      }
      p.dx += (tx - p.dx) * 0.15
      p.dy += (ty - p.dy) * 0.15
      return [px + p.dx, py + p.dy]
    }

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    if (!state.current) reset()

    const runToEnd = () => {
      const s = state.current
      let r
      do {
        r = iterate(s.points, s.cents)
        s.iter++
      } while (r.changed && s.iter < 50)
      s.cents.forEach((c) => {
        c.x = c.tx
        c.y = c.ty
      })
      s.done = true
      setStatus({ iter: s.iter, inertia: r.inertia, done: true })
    }

    const draw = (now) => {
      const s = state.current
      if (!reduce && !s.done && now - s.lastStep > STEP_MS) {
        const r = iterate(s.points, s.cents)
        s.iter++
        s.lastStep = now
        s.tweenStart = now
        if (!r.changed) s.done = true
        setStatus({ iter: s.iter, inertia: r.inertia, done: s.done })
      }
      if (reduce && !s.done) runToEnd()

      const t = reduce ? 1 : ease(Math.min(1, (now - s.tweenStart) / TWEEN_MS))
      s.cents.forEach((c) => {
        c.x = c.fx + (c.tx - c.fx) * t
        c.y = c.fy + (c.ty - c.fy) * t
      })

      ctx.clearRect(0, 0, w, h)

      // spokes from each point to its centroid
      ctx.lineWidth = 1
      s.points.forEach((p) => {
        if (p.c < 0) return
        const c = s.cents[p.c]
        ctx.strokeStyle = palette[p.c]
        ctx.globalAlpha = 0.13
        const [x, y] = shown(p)
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(c.x * w, c.y * h)
        ctx.stroke()
      })

      ctx.globalAlpha = 1
      s.points.forEach((p) => {
        ctx.fillStyle = p.c < 0 ? idle : palette[p.c]
        const [x, y] = p.c < 0 ? shown(p) : [p.x * w + p.dx, p.y * h + p.dy]
        ctx.beginPath()
        ctx.arc(x, y, 2.6, 0, Math.PI * 2)
        ctx.fill()
      })

      // centroids: ring with crosshair
      s.cents.forEach((c, i) => {
        const x = c.x * w
        const y = c.y * h
        ctx.strokeStyle = palette[i]
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(x, y, 9, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x - 15, y)
        ctx.lineTo(x + 15, y)
        ctx.moveTo(x, y - 15)
        ctx.lineTo(x, y + 15)
        ctx.lineWidth = 1
        ctx.stroke()
      })

      if (!reduce) raf = requestAnimationFrame(draw)
    }

    size()
    const onResize = () => {
      size()
      if (reduce) draw(performance.now())
    }
    window.addEventListener('resize', onResize)
    if (!reduce) {
      window.addEventListener('pointermove', onMove)
      document.addEventListener('pointerleave', onLeave)
    }
    if (reduce) {
      // redraw on reseed only
      draw(performance.now())
    } else {
      state.current.lastStep = performance.now() - STEP_MS / 2
      raf = requestAnimationFrame(draw)
    }
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
    // re-run when the theme changes (new colours) or after a reseed
  }, [theme, reset, seedId])

  return (
    <figure className="kmeans">
      <canvas ref={canvasRef} className="kmeans-canvas" aria-hidden="true" onClick={reset} />
      <figcaption className="kmeans-caption">
        <span>
          Live k-means on {N} points, k = {K}.{' '}
          {status.inertia === null
            ? 'Starting…'
            : `${status.done ? 'Converged after' : 'Iteration'} ${status.iter}${status.done ? (status.iter === 1 ? ' iteration' : ' iterations') : ''}, inertia ${(status.inertia * 100).toFixed(2)}.`}
        </span>
        <button type="button" className="text-button" onClick={reset}>
          Reseed data
        </button>
      </figcaption>
    </figure>
  )
}
