// Raw WebGL driver for the hero field (no three.js: this has to stay tiny and fast).
// Loaded with a dynamic import after first paint.
import { palette } from '../../design/tokens'
import { getDeviceTier } from '../../hooks/useDeviceTier'
import { pointer } from '../../hooks/useCursor'
import { getWindowLevel } from '../../hooks/useWindowLevel'
import { fragment, vertex } from './fieldShader'

type Opts = {
  canvas: HTMLCanvasElement
  host: HTMLElement
  reduce: boolean
  onLevel: (level: number) => void // 0..1, for the slice readout
}

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)

export function startField({ canvas, host, reduce, onLevel }: Opts) {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' })
  if (!gl || !gl.getExtension('OES_standard_derivatives')) return null

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader')
    return sh
  }
  const prog = gl.createProgram()!
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vertex))
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragment))
  gl.linkProgram(prog)
  gl.useProgram(prog)

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'aPos')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const U = (n: string) => gl.getUniformLocation(prog, n)
  const u = {
    res: U('uRes'), time: U('uTime'), recon: U('uRecon'), level: U('uLevel'), contrast: U('uContrast'),
    probe: U('uProbe'), mobile: U('uMobile'), fg: U('uFg'), accent: U('uAccent'),
  }

  const tier = getDeviceTier()
  const frameMs = 1000 / tier.fps
  let w = 0
  let h = 0
  let scale = 1

  const resize = () => {
    scale = Math.min(window.devicePixelRatio || 1, 1.5) * (tier.low ? 0.6 : 0.85)
    w = canvas.clientWidth
    h = canvas.clientHeight
    canvas.width = Math.round(w * scale)
    canvas.height = Math.round(h * scale)
    gl.viewport(0, 0, canvas.width, canvas.height)
  }

  const t0 = performance.now()
  let level = 0
  let px = 0
  let py = 0
  let strength = 0
  let visible = true
  let raf = 0
  let last = 0

  // touch devices: the level follows scroll through the hero, nudged by device tilt where allowed
  let tilt = 0
  const onTilt = (e: DeviceOrientationEvent) => {
    if (e.beta != null) tilt = Math.max(-1, Math.min(1, (e.beta - 45) / 45))
  }
  if (tier.touch) window.addEventListener('deviceorientation', onTilt)

  const draw = (now: number) => {
    const t = now - t0
    const wl = getWindowLevel()
    const r = host.getBoundingClientRect()
    const inside = !tier.touch && pointer.active && pointer.y >= r.top && pointer.y <= r.bottom

    let target: number
    if (tier.touch) target = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height))) + tilt * 0.1
    else if (inside) target = 1 - (pointer.y - r.top) / r.height
    else target = 0.5 + Math.sin(t / 5000) * 0.2 // idle drift
    level = reduce ? 0.5 : level + (target - level) * 0.08

    if (inside) {
      px += (pointer.x - r.left - px) * (reduce ? 1 : 0.18)
      py += (pointer.y - r.top - py) * (reduce ? 1 : 0.18)
    }
    strength += ((inside ? 1 : 0) - strength) * (reduce ? 1 : 0.06)

    const light = wl.film === 'light'
    gl.uniform2f(u.res, canvas.width, canvas.height)
    gl.uniform1f(u.time, reduce ? 0 : t / 1000)
    gl.uniform1f(u.recon, reduce ? 1 : Math.min(1, t / 1200))
    gl.uniform1f(u.level, level * 0.6)
    gl.uniform1f(u.contrast, wl.window / 100)
    gl.uniform3f(u.probe, px * scale, (h - py) * scale, strength)
    gl.uniform1f(u.mobile, w < 900 ? 1 : 0)
    gl.uniform3fv(u.fg, hex(light ? '#1D1B17' : palette.bone))
    gl.uniform3fv(u.accent, hex(light ? palette.tealInk : palette.teal))
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    onLevel(level)
  }

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop)
    if (now - last < frameMs - 1) return
    last = now
    draw(now)
  }
  const run = () => {
    cancelAnimationFrame(raf)
    if (visible && !reduce && !document.hidden) raf = requestAnimationFrame(loop)
  }

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
    redraw: () => reduce && draw(performance.now()),
    stop: () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', run)
      window.removeEventListener('deviceorientation', onTilt)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}
