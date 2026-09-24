import { useEffect, useRef } from 'react'
import { pointer, useCursor } from '../../hooks/useCursor'
import { getDeviceTier } from '../../hooks/useDeviceTier'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import styles from './AttentionCursor.module.css'

const TARGETS = 'a[href], button:not([disabled]), summary, input, textarea, select, [role="slider"], [data-attn]'
const MAGNETIC = 'button, .btn, [role="slider"]'
const RADIUS = 340 // px: elements further away get no attention
const TAU = 70 // softmax temperature over distance

type Head = { el: HTMLElement; r: DOMRect; d: number; w: number }

// Signature 2: attention cursor. Faint lines run from the pointer to the 2–3 nearest interactive
// elements, each labelled with its softmax weight; the top-weighted element gets a subtle ring.
// Over buttons the cursor magnetises to the centre. Fine pointers only: touch keeps native input.
export function AttentionCursor() {
  useCursor()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const dot = dotRef.current
    if (!canvas || !dot || !getDeviceTier().finePointer) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduce = prefersReducedMotion()
    document.documentElement.classList.add('has-attention')

    let els: HTMLElement[] = []
    const collect = () => {
      els = Array.from(document.querySelectorAll<HTMLElement>(TARGETS)).filter((el) => !el.closest('[data-attn="off"], [inert]'))
    }
    collect()
    let mo = 0
    const observer = new MutationObserver(() => {
      clearTimeout(mo)
      mo = window.setTimeout(collect, 250)
    })
    observer.observe(document.body, { childList: true, subtree: true })

    let w = 0
    let h = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    let fg = ''
    let accent = ''
    let frame = 0
    let top: HTMLElement | null = null
    let x = -100
    let y = -100
    let hover: HTMLElement | null = null
    const over = (e: PointerEvent) => {
      hover = (e.target as HTMLElement).closest<HTMLElement>(TARGETS)
    }
    document.addEventListener('pointerover', over)

    // idle skip: once the pointer and page have been still for a moment, stop re-measuring
    let dirty = 30
    let lpx = -1
    let lpy = -1
    const wake = () => (dirty = 30)
    window.addEventListener('scroll', wake, { passive: true })
    window.addEventListener('attn-wake', wake)

    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (pointer.x !== lpx || pointer.y !== lpy) {
        lpx = pointer.x
        lpy = pointer.y
        dirty = 30
      }
      if (dirty-- <= 0) return
      if (frame++ % 30 === 0) {
        const cs = getComputedStyle(document.documentElement)
        fg = cs.getPropertyValue('--fg').trim()
        accent = cs.getPropertyValue('--accent').trim()
      }
      ctx.clearRect(0, 0, w, h)
      const on = pointer.active && !document.documentElement.classList.contains('dialog-open')
      dot.style.opacity = on ? '1' : '0'
      if (!on) {
        setTop(null)
        return
      }

      // ── score every visible interactive element by distance to its box ──
      const heads: Head[] = []
      for (const el of els) {
        if (!el.isConnected) continue
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.bottom < 0 || r.top > h || r.right < 0 || r.left > w) continue
        const dx = Math.max(r.left - pointer.x, 0, pointer.x - r.right)
        const dy = Math.max(r.top - pointer.y, 0, pointer.y - r.bottom)
        const d = Math.hypot(dx, dy)
        if (d < RADIUS) heads.push({ el, r, d, w: 0 })
      }
      heads.sort((a, b) => a.d - b.d)
      const k = heads.slice(0, 3)
      const exps = k.map((hd) => Math.exp(-hd.d / TAU))
      const sum = exps.reduce((s, v) => s + v, 0) || 1
      k.forEach((hd, i) => (hd.w = exps[i] / sum))

      // ── cursor: magnetise toward buttons ──
      let tx = pointer.x
      let ty = pointer.y
      const mag = hover?.closest<HTMLElement>(MAGNETIC)
      if (mag) {
        const r = mag.getBoundingClientRect()
        tx += (r.left + r.width / 2 - tx) * 0.3
        ty += (r.top + r.height / 2 - ty) * 0.3
      }
      const ease = reduce ? 1 : 0.35
      x += (tx - x) * ease
      y += (ty - y) * ease
      dot.style.transform = `translate(${x}px, ${y}px)`
      dot.classList.toggle(styles.engaged, !!hover)

      // ── attention lines + weights ──
      ctx.font = '500 10px "JetBrains Mono", ui-monospace, monospace'
      ctx.textBaseline = 'middle'
      k.forEach((hd, i) => {
        if (hd.d === 0 && hover === hd.el) return // already inside it: the ring says enough
        const cx = Math.min(Math.max(x, hd.r.left), hd.r.right)
        const cy = Math.min(Math.max(y, hd.r.top), hd.r.bottom)
        ctx.strokeStyle = i === 0 ? accent : fg
        ctx.globalAlpha = 0.12 + hd.w * 0.6
        ctx.lineWidth = i === 0 ? 1.25 : 1
        ctx.setLineDash(i === 0 ? [] : [2, 4])
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(cx, cy)
        ctx.stroke()
        // weight label at the midpoint
        const label = hd.w.toFixed(2)
        const mx = (x + cx) / 2
        const my = (y + cy) / 2
        ctx.globalAlpha = 0.35 + hd.w * 0.65
        ctx.fillStyle = i === 0 ? accent : fg
        ctx.fillText(label, mx + 6, my - 8)
      })
      ctx.setLineDash([])
      ctx.globalAlpha = 1

      setTop(k[0] && k[0].w > 0.45 ? k[0].el : null)
    }

    const setTop = (el: HTMLElement | null) => {
      if (el === top) return
      top?.removeAttribute('data-attn-top')
      top = el
      top?.setAttribute('data-attn-top', '')
    }

    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      clearTimeout(mo)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', wake)
      window.removeEventListener('attn-wake', wake)
      document.removeEventListener('pointerover', over)
      top?.removeAttribute('data-attn-top')
      document.documentElement.classList.remove('has-attention')
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div ref={dotRef} className={styles.dot} aria-hidden="true">
        <span />
      </div>
    </>
  )
}
