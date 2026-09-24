import { useEffect, useRef } from 'react'
import { getDeviceTier } from '../../hooks/useDeviceTier'
import { pointer, useCursor } from '../../hooks/useCursor'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import styles from './CrosshairCursor.module.css'

const TARGETS = 'a, button, summary, input, textarea, select, label, [role="slider"], [data-cursor]'

// Signature 2: viewport-wide crosshairs with a live x,y readout. Over an interactive element the
// crosshair is pulled to its centre and a measurement bracket (with its W×H) frames it.
// Fine pointers only; touch devices keep their native behavior.
export function CrosshairCursor() {
  useCursor()
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el || !getDeviceTier().finePointer) return
    document.documentElement.classList.add('has-crosshair')
    const reduce = prefersReducedMotion()
    const [h, v, bracket, label] = ['h', 'v', 'bracket', 'label'].map((k) => el.querySelector<HTMLElement>(`[data-k="${k}"]`)!)
    let target: HTMLElement | null = null
    let x = -100
    let y = -100
    let bx = 0, by = 0, bw = 0, bh = 0
    let raf = 0

    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>(TARGETS)
      target = t && !t.closest('[data-cursor="none"]') ? t : null
    }
    document.addEventListener('pointerover', over)

    const frame = () => {
      raf = requestAnimationFrame(frame)
      el.style.opacity = pointer.active ? '1' : '0'
      if (!pointer.active) return
      let tx = pointer.x
      let ty = pointer.y
      if (target && !target.isConnected) target = null
      if (target) {
        const r = target.getBoundingClientRect()
        // magnetise: pull 35% of the way to the element's centre
        tx += (r.left + r.width / 2 - tx) * 0.35
        ty += (r.top + r.height / 2 - ty) * 0.35
        const pad = 6
        const k = reduce ? 1 : 0.3
        bx += (r.left - pad - bx) * k
        by += (r.top - pad - by) * k
        bw += (r.width + pad * 2 - bw) * k
        bh += (r.height + pad * 2 - bh) * k
        bracket.style.transform = `translate(${bx}px, ${by}px)`
        bracket.style.width = `${bw}px`
        bracket.style.height = `${bh}px`
        bracket.dataset.dim = `${Math.round(r.width)} × ${Math.round(r.height)}`
        bracket.classList.add(styles.on)
      } else {
        bx = pointer.x
        by = pointer.y
        bw = bh = 0
        bracket.classList.remove(styles.on)
      }
      const k = reduce ? 1 : 0.35
      x += (tx - x) * k
      y += (ty - y) * k
      h.style.transform = `translateY(${y}px)`
      v.style.transform = `translateX(${x}px)`
      label.style.transform = `translate(${x + 14}px, ${y + 12}px)`
      label.textContent = `x ${String(Math.round(pointer.x)).padStart(4, '0')} · y ${String(Math.round(pointer.y)).padStart(4, '0')}`
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('pointerover', over)
      document.documentElement.classList.remove('has-crosshair')
    }
  }, [])

  return (
    <div ref={root} className={styles.cursor} aria-hidden="true">
      <span data-k="h" className={styles.h} />
      <span data-k="v" className={styles.v} />
      <span data-k="bracket" className={styles.bracket}>
        <i />
        <i />
        <i />
        <i />
      </span>
      <span data-k="label" className={`mono ${styles.label}`} />
    </div>
  )
}

// Keyboard focus gets the same crosshair bracket (the CSS outline stays as a fallback).
export function FocusBrackets() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current!
    document.documentElement.classList.add('focus-brackets')
    let raf = 0
    let current: HTMLElement | null = null
    const place = () => {
      raf = requestAnimationFrame(place)
      if (!current || !current.isConnected || !current.matches(':focus-visible')) {
        el.classList.remove(styles.on)
        return
      }
      const r = current.getBoundingClientRect()
      const pad = 5
      el.style.transform = `translate(${r.left - pad}px, ${r.top - pad}px)`
      el.style.width = `${r.width + pad * 2}px`
      el.style.height = `${r.height + pad * 2}px`
      el.classList.add(styles.on)
    }
    const onIn = (e: FocusEvent) => {
      current = e.target as HTMLElement
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(place)
    }
    const onOut = () => {
      current = null
      cancelAnimationFrame(raf)
      el.classList.remove(styles.on)
    }
    document.addEventListener('focusin', onIn)
    document.addEventListener('focusout', onOut)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('focusin', onIn)
      document.removeEventListener('focusout', onOut)
      document.documentElement.classList.remove('focus-brackets')
    }
  }, [])
  return (
    <span ref={ref} className={`${styles.bracket} ${styles.focus}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  )
}
