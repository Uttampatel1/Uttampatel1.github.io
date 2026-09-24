// Live illustrations for project cards (the services ones live in ServiceCanvas.jsx).
// Same contract: setupX() returns (ctx, w, h, t, col) => void, where t is ms and
// col = { c1, c2, c3, text, muted, rule, bg }.
//   equity      – price with a moving average; buy/sell marks where they cross
//   graph       – transactions flowing through a graph; one account gets flagged
//   loss        – training and validation loss curves being drawn epoch by epoch
//   federated   – clients send updates to a server, which sends the averaged model back
//   qubits      – a quantum circuit scrolling past, with a live measurement histogram
//   prune       – a weight matrix losing its smallest weights; model size shrinks
//   molecule    – a rotating ball-and-stick molecule
//   retrieval   – a query moving through an embedding space, linked to its top-k neighbours
//   contrastive – paired views of the same sample pulled together into clusters

const rand = (a, b) => a + Math.random() * (b - a)
const TAU = Math.PI * 2
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

const label = (ctx, col, size = 10) => {
  ctx.font = `${size}px "JetBrains Mono", ui-monospace, monospace`
  ctx.fillStyle = col.muted
}
const dot = (ctx, x, y, r) => {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  ctx.fill()
}

function setupEquity() {
  const n = 90
  let p = 0.5
  const prices = Array.from({ length: n }, () => (p = Math.min(0.9, Math.max(0.1, p + rand(-0.03, 0.031)))))
  let last = 0
  return (ctx, w, h, t, col) => {
    if (t - last > 140) {
      last = t
      p = Math.min(0.9, Math.max(0.1, p + rand(-0.03, 0.031)))
      prices.push(p)
      prices.shift()
    }
    const X = (i) => (i / (n - 1)) * w
    const Y = (v) => h - v * h
    const ma = prices.map((_, i) => {
      const s = prices.slice(Math.max(0, i - 19), i + 1)
      return s.reduce((a, b) => a + b, 0) / s.length
    })
    ctx.strokeStyle = col.rule
    ctx.lineWidth = 1
    for (let g = 1; g < 4; g++) {
      ctx.beginPath()
      ctx.moveTo(0, (g / 4) * h)
      ctx.lineTo(w, (g / 4) * h)
      ctx.stroke()
    }
    ctx.strokeStyle = col.c2
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ma.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))))
    ctx.stroke()
    ctx.strokeStyle = col.text
    ctx.lineWidth = 1.4
    ctx.beginPath()
    prices.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))))
    ctx.stroke()
    let lastMark = -99
    for (let i = 20; i < n; i++) {
      const up = prices[i - 1] <= ma[i - 1] && prices[i] > ma[i]
      const down = prices[i - 1] >= ma[i - 1] && prices[i] < ma[i]
      if ((!up && !down) || i - lastMark < 10) continue
      lastMark = i
      const x = X(i)
      const y = Y(prices[i])
      ctx.fillStyle = up ? col.c1 : col.c3
      ctx.beginPath()
      ctx.moveTo(x, up ? y + 5 : y - 5)
      ctx.lineTo(x - 5, up ? y + 13 : y - 13)
      ctx.lineTo(x + 5, up ? y + 13 : y - 13)
      ctx.fill()
    }
    label(ctx, col)
    ctx.fillText('price · MA(20)', 8, 14)
  }
}

function setupGraph() {
  const nodes = Array.from({ length: 24 }, () => ({ x: rand(0.06, 0.94), y: rand(0.1, 0.9) }))
  const edges = []
  nodes.forEach((a, i) => {
    const near = nodes
      .map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }))
      .filter((e) => e.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2)
    near.forEach(({ j }) => i < j && edges.push([i, j]))
  })
  const packets = Array.from({ length: 16 }, () => ({ e: (Math.random() * edges.length) | 0, s: Math.random(), v: rand(0.004, 0.01) }))
  let flagged = 0
  let flagAt = 0
  return (ctx, w, h, t, col) => {
    if (t - flagAt > 2400) {
      flagAt = t
      flagged = (Math.random() * nodes.length) | 0
    }
    const pulse = ((t - flagAt) % 1200) / 1200
    edges.forEach(([i, j]) => {
      const hot = i === flagged || j === flagged
      ctx.strokeStyle = hot ? col.c3 : col.rule
      ctx.lineWidth = hot ? 1.4 : 1
      ctx.beginPath()
      ctx.moveTo(nodes[i].x * w, nodes[i].y * h)
      ctx.lineTo(nodes[j].x * w, nodes[j].y * h)
      ctx.stroke()
    })
    packets.forEach((p) => {
      p.s += p.v
      if (p.s > 1) {
        p.s = 0
        p.e = (Math.random() * edges.length) | 0
      }
      const [i, j] = edges[p.e]
      ctx.fillStyle = col.c1
      dot(ctx, (nodes[i].x + (nodes[j].x - nodes[i].x) * p.s) * w, (nodes[i].y + (nodes[j].y - nodes[i].y) * p.s) * h, 1.8)
    })
    nodes.forEach((n, i) => {
      ctx.fillStyle = i === flagged ? col.c3 : col.muted
      dot(ctx, n.x * w, n.y * h, i === flagged ? 4.5 : 3)
    })
    const f = nodes[flagged]
    ctx.strokeStyle = col.c3
    ctx.globalAlpha = 1 - pulse
    ctx.beginPath()
    ctx.arc(f.x * w, f.y * h, 5 + pulse * 18, 0, TAU)
    ctx.stroke()
    ctx.globalAlpha = 1
    label(ctx, col)
    ctx.fillText('flagged', Math.min(w - 50, f.x * w + 10), f.y * h - 8)
  }
}

function setupLoss() {
  const PERIOD = 5200
  const epochs = 60
  let seed = []
  let cycle = -1
  return (ctx, w, h, t, col) => {
    const c = Math.floor(t / PERIOD)
    if (c !== cycle) {
      cycle = c
      seed = Array.from({ length: epochs }, () => [rand(-1, 1), rand(-1, 1)])
    }
    const shown = Math.floor(ease(Math.min(1, (t % PERIOD) / (PERIOD * 0.8))) * epochs)
    const X = (i) => 10 + (i / (epochs - 1)) * (w - 20)
    const Y = (v) => 18 + (1 - v) * (h - 30)
    const train = (i) => 0.08 + 0.85 * Math.exp(-i / 11) + seed[i][0] * 0.02
    const val = (i) => 0.16 + 0.8 * Math.exp(-i / 13) + seed[i][1] * 0.025 + Math.max(0, i - 44) * 0.002
    ctx.strokeStyle = col.rule
    ctx.beginPath()
    ctx.moveTo(10, h - 12)
    ctx.lineTo(w - 10, h - 12)
    ctx.stroke()
    ;[
      [train, col.c1],
      [val, col.c2],
    ].forEach(([fn, color]) => {
      ctx.strokeStyle = color
      ctx.lineWidth = 1.6
      ctx.beginPath()
      for (let i = 0; i <= shown && i < epochs; i++) i ? ctx.lineTo(X(i), Y(fn(i))) : ctx.moveTo(X(i), Y(fn(i)))
      ctx.stroke()
      if (shown > 0) {
        ctx.fillStyle = color
        dot(ctx, X(Math.min(shown, epochs - 1)), Y(fn(Math.min(shown, epochs - 1))), 2.6)
      }
    })
    label(ctx, col)
    ctx.fillText(`epoch ${String(Math.min(shown, epochs)).padStart(2, '0')}`, 10, 12)
    ctx.textAlign = 'right'
    ctx.fillStyle = col.c1
    ctx.fillText('train', w - 60, 12)
    ctx.fillStyle = col.c2
    ctx.fillText('val', w - 12, 12)
    ctx.textAlign = 'left'
  }
}

function setupFederated() {
  const K = 6
  const PERIOD = 3000
  return (ctx, w, h, t, col) => {
    const cx = w / 2
    const cy = h / 2
    const R = Math.min(w * 0.38, h * 0.36)
    const ph = (t % PERIOD) / PERIOD
    const clients = Array.from({ length: K }, (_, i) => {
      const a = (i / K) * TAU - Math.PI / 2
      return [cx + Math.cos(a) * R * 1.25, cy + Math.sin(a) * R]
    })
    clients.forEach(([x, y], i) => {
      ctx.strokeStyle = col.rule
      ctx.setLineDash([3, 4])
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(cx, cy)
      ctx.stroke()
      ctx.setLineDash([])
      // local data stays put: a little stack beside each client
      ctx.fillStyle = col.muted
      for (let k = 0; k < 3; k++) ctx.fillRect(x - 7 + k * 5, y + 11, 3, 3)
      ctx.fillStyle = col.bg
      ctx.strokeStyle = col.muted
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.rect(x - 8, y - 8, 16, 16)
      ctx.fill()
      ctx.stroke()
      // phase 1: updates up; phase 2: global model back down
      const up = ph < 0.45 ? ph / 0.45 : null
      const down = ph > 0.55 ? (ph - 0.55) / 0.45 : null
      const lag = (i / K) * 0.15
      if (up !== null && up > lag) {
        const s = Math.min(1, (up - lag) / (1 - lag))
        ctx.fillStyle = col.c2
        dot(ctx, x + (cx - x) * s, y + (cy - y) * s, 2.6)
      }
      if (down !== null) {
        ctx.fillStyle = col.c1
        dot(ctx, cx + (x - cx) * down, cy + (y - cy) * down, 2.6)
      }
    })
    const agg = ph > 0.45 && ph < 0.6 ? 1 - Math.abs(ph - 0.525) / 0.075 : 0
    ctx.fillStyle = col.bg
    ctx.strokeStyle = col.c1
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(cx, cy, 13 + agg * 4, 0, TAU)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = col.c1
    ctx.globalAlpha = 0.3 + agg * 0.7
    dot(ctx, cx, cy, 6)
    ctx.globalAlpha = 1
    label(ctx, col)
    ctx.fillText(ph < 0.5 ? 'local updates →' : '← averaged model', 8, 14)
  }
}

function setupQubits() {
  const wires = 4
  const gates = []
  const spawn = (x) => {
    const q = (Math.random() * wires) | 0
    const type = Math.random() < 0.3 ? 'cx' : Math.random() < 0.5 ? 'H' : Math.random() < 0.5 ? 'X' : 'Rz'
    gates.push({ x, q, type, t2: (q + 1 + ((Math.random() * (wires - 1)) | 0)) % wires })
  }
  for (let x = 0.1; x < 1; x += 0.11) spawn(x)
  const probs = Array.from({ length: 8 }, () => Math.random())
  let lastT = 0
  return (ctx, w, h, t, col) => {
    const dt = lastT ? Math.min(50, t - lastT) : 16
    lastT = t
    const cw = w * 0.7
    const Y = (q) => 18 + ((q + 0.5) / wires) * (h - 30)
    ctx.strokeStyle = col.rule
    ctx.lineWidth = 1
    for (let q = 0; q < wires; q++) {
      ctx.beginPath()
      ctx.moveTo(22, Y(q))
      ctx.lineTo(cw, Y(q))
      ctx.stroke()
      label(ctx, col)
      ctx.fillText(`q${q}`, 4, Y(q) + 3)
    }
    gates.forEach((g) => (g.x -= dt * 0.00005))
    while (gates.length && gates[0].x < 0.04) gates.shift()
    if (!gates.length || gates[gates.length - 1].x < 0.9) spawn(1)
    ctx.save()
    ctx.beginPath()
    ctx.rect(22, 0, cw - 22, h)
    ctx.clip()
    gates.forEach((g) => {
      const x = 22 + g.x * (cw - 22)
      if (g.type === 'cx') {
        ctx.strokeStyle = col.c2
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.moveTo(x, Y(g.q))
        ctx.lineTo(x, Y(g.t2))
        ctx.stroke()
        ctx.fillStyle = col.c2
        dot(ctx, x, Y(g.q), 3.5)
        ctx.beginPath()
        ctx.arc(x, Y(g.t2), 7, 0, TAU)
        ctx.stroke()
      } else {
        ctx.fillStyle = col.bg
        ctx.strokeStyle = col.c1
        ctx.lineWidth = 1.2
        ctx.fillRect(x - 10, Y(g.q) - 9, 20, 18)
        ctx.strokeRect(x - 10, Y(g.q) - 9, 20, 18)
        ctx.font = '10px "JetBrains Mono", ui-monospace, monospace'
        ctx.fillStyle = col.text
        ctx.textAlign = 'center'
        ctx.fillText(g.type, x, Y(g.q) + 3.5)
        ctx.textAlign = 'left'
      }
    })
    ctx.restore()
    // measurement histogram
    const bx = cw + 14
    const bw = (w - bx - 8) / probs.length
    probs.forEach((p, i) => {
      probs[i] += (Math.random() - 0.5) * 0.06
      probs[i] = Math.min(1, Math.max(0.05, probs[i]))
      ctx.fillStyle = i === probs.indexOf(Math.max(...probs)) ? col.c1 : col.muted
      const bh = probs[i] * (h - 40)
      ctx.fillRect(bx + i * bw + 1, h - 14 - bh, bw - 2, bh)
    })
    label(ctx, col)
    ctx.fillText('shots', bx, 12)
  }
}

function setupPrune() {
  const cols = 16
  const rows = 8
  const weights = Array.from({ length: cols * rows }, () => Math.abs(rand(-1, 1) * rand(0.2, 1)))
  const order = weights.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0])
  const rank = new Array(weights.length)
  order.forEach(([, i], r) => (rank[i] = r / weights.length))
  const PERIOD = 5000
  return (ctx, w, h, t, col) => {
    const ph = (t % PERIOD) / PERIOD
    const cut = ph < 0.75 ? ease(ph / 0.75) * 0.9 : 0.9 * (1 - (ph - 0.75) / 0.25)
    const gw = w - 20
    const gh = h - 40
    const cs = Math.min(gw / cols, gh / rows)
    const ox = (w - cs * cols) / 2
    weights.forEach((v, i) => {
      const x = ox + (i % cols) * cs
      const y = 20 + Math.floor(i / cols) * cs
      const pruned = rank[i] < cut
      ctx.fillStyle = pruned ? col.rule : col.c1
      ctx.globalAlpha = pruned ? 0.6 : 0.25 + v * 0.75
      ctx.fillRect(x + 1, y + 1, cs - 2, cs - 2)
    })
    ctx.globalAlpha = 1
    const barW = w - 20
    ctx.fillStyle = col.rule
    ctx.fillRect(10, h - 12, barW, 3)
    ctx.fillStyle = col.c2
    ctx.fillRect(10, h - 12, barW * (1 - cut), 3)
    label(ctx, col)
    ctx.fillText(`weights kept ${Math.round((1 - cut) * 100)}%`, 10, 13)
  }
}

function setupMolecule() {
  // a small ring with side chains, built procedurally
  const atoms = []
  const bonds = []
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU
    atoms.push({ p: [Math.cos(a) * 0.5, Math.sin(a) * 0.5, rand(-0.08, 0.08)], k: i % 3 === 0 ? 1 : 0 })
    bonds.push([i, (i + 1) % 6])
  }
  ;[0, 2, 4].forEach((i) => {
    const [x, y] = atoms[i].p
    const j = atoms.length
    atoms.push({ p: [x * 1.9, y * 1.9, rand(-0.3, 0.3)], k: 2 })
    bonds.push([i, j])
    atoms.push({ p: [x * 2.5, y * 2.5 + 0.2, rand(-0.4, 0.4)], k: 0 })
    bonds.push([j, j + 1])
  })
  return (ctx, w, h, t, col) => {
    const a = t / 2600
    const b = Math.sin(t / 3700) * 0.5
    const s = Math.min(w, h) * 0.3
    const proj = atoms.map(({ p: [x, y, z] }) => {
      const x1 = x * Math.cos(a) + z * Math.sin(a)
      const z1 = -x * Math.sin(a) + z * Math.cos(a)
      const y1 = y * Math.cos(b) - z1 * Math.sin(b)
      const z2 = y * Math.sin(b) + z1 * Math.cos(b)
      const f = 2.6 / (2.6 + z2)
      return { x: w / 2 + x1 * s * f, y: h / 2 + y1 * s * f, z: z2, f }
    })
    ctx.strokeStyle = col.muted
    ctx.lineWidth = 1.4
    bonds.forEach(([i, j]) => {
      ctx.beginPath()
      ctx.moveTo(proj[i].x, proj[i].y)
      ctx.lineTo(proj[j].x, proj[j].y)
      ctx.stroke()
    })
    const colors = [col.text, col.c1, col.c2]
    atoms
      .map((at, i) => ({ ...proj[i], k: at.k }))
      .sort((p, q) => q.z - p.z)
      .forEach((p) => {
        ctx.fillStyle = col.bg
        dot(ctx, p.x, p.y, 7 * p.f)
        ctx.fillStyle = colors[p.k]
        ctx.globalAlpha = 0.55 + (1 - (p.z + 1) / 2) * 0.45
        dot(ctx, p.x, p.y, 6 * p.f)
        ctx.globalAlpha = 1
      })
    label(ctx, col)
    ctx.fillText('candidate', 8, 14)
  }
}

function setupRetrieval() {
  const pts = Array.from({ length: 70 }, () => {
    const c = (Math.random() * 4) | 0
    const cx = [0.25, 0.7, 0.4, 0.8][c]
    const cy = [0.3, 0.3, 0.72, 0.75][c]
    return { x: cx + rand(-0.14, 0.14), y: cy + rand(-0.14, 0.14) }
  })
  return (ctx, w, h, t, col) => {
    const qx = 0.5 + Math.cos(t / 3100) * 0.3
    const qy = 0.5 + Math.sin(t / 2300) * 0.28
    const ranked = pts.map((p, i) => ({ i, d: (p.x - qx) ** 2 + ((p.y - qy) * 0.8) ** 2 })).sort((a, b) => a.d - b.d)
    const top = new Set(ranked.slice(0, 5).map((r) => r.i))
    pts.forEach((p, i) => {
      if (!top.has(i)) {
        ctx.fillStyle = col.muted
        ctx.globalAlpha = 0.5
        dot(ctx, p.x * w, p.y * h, 2)
      }
    })
    ctx.globalAlpha = 1
    ranked.slice(0, 5).forEach(({ i }, r) => {
      const p = pts[i]
      ctx.strokeStyle = col.c1
      ctx.globalAlpha = 0.9 - r * 0.14
      ctx.beginPath()
      ctx.moveTo(qx * w, qy * h)
      ctx.lineTo(p.x * w, p.y * h)
      ctx.stroke()
      ctx.fillStyle = col.c1
      dot(ctx, p.x * w, p.y * h, 3.2)
    })
    ctx.globalAlpha = 1
    ctx.fillStyle = col.c2
    ctx.strokeStyle = col.c2
    dot(ctx, qx * w, qy * h, 4.5)
    ctx.beginPath()
    ctx.arc(qx * w, qy * h, Math.sqrt(ranked[4].d) * Math.min(w, h) * 1.1 + 4, 0, TAU)
    ctx.globalAlpha = 0.35
    ctx.stroke()
    ctx.globalAlpha = 1
    label(ctx, col)
    ctx.fillText('query · top-5', 8, 14)
  }
}

function setupContrastive() {
  const K = 3
  const centers = [
    [0.25, 0.35],
    [0.72, 0.3],
    [0.5, 0.75],
  ]
  const pairs = Array.from({ length: 21 }, (_, i) => {
    const c = i % K
    const tx = centers[c][0] + rand(-0.08, 0.08)
    const ty = centers[c][1] + rand(-0.08, 0.08)
    return { c, tx, ty, a: [rand(0.05, 0.95), rand(0.1, 0.9)], b: [rand(0.05, 0.95), rand(0.1, 0.9)] }
  })
  const PERIOD = 5200
  return (ctx, w, h, t, col) => {
    const ph = (t % PERIOD) / PERIOD
    const s = ph < 0.7 ? ease(ph / 0.7) : 1 - ease((ph - 0.7) / 0.3)
    const colors = [col.c1, col.c2, col.c3]
    pairs.forEach((p) => {
      const ax = p.a[0] + (p.tx - 0.015 - p.a[0]) * s
      const ay = p.a[1] + (p.ty - p.a[1]) * s
      const bx = p.b[0] + (p.tx + 0.015 - p.b[0]) * s
      const by = p.b[1] + (p.ty - p.b[1]) * s
      ctx.strokeStyle = colors[p.c]
      ctx.globalAlpha = 0.25 + 0.3 * (1 - s)
      ctx.setLineDash([2, 3])
      ctx.beginPath()
      ctx.moveTo(ax * w, ay * h)
      ctx.lineTo(bx * w, by * h)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 0.35 + 0.65 * s
      ctx.fillStyle = colors[p.c]
      dot(ctx, ax * w, ay * h, 2.8)
      ctx.strokeStyle = colors[p.c]
      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.arc(bx * w, by * h, 2.8, 0, TAU)
      ctx.stroke()
    })
    label(ctx, col)
    ctx.fillText(s > 0.5 ? 'views aligned' : 'augmented views', 8, 14)
  }
}

export const PROJECT_SETUPS = {
  equity: setupEquity,
  graph: setupGraph,
  loss: setupLoss,
  federated: setupFederated,
  qubits: setupQubits,
  prune: setupPrune,
  molecule: setupMolecule,
  retrieval: setupRetrieval,
  contrastive: setupContrastive,
}
