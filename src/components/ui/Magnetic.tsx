import { useEffect, useRef, type ReactElement } from 'react'
import { getDeviceTier } from '../../hooks/useDeviceTier'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'

// Wraps a single interactive child and pulls it toward the pointer while hovered.
export function Magnetic({ children, strength = 0.28 }: { children: ReactElement; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !getDeviceTier().finePointer || prefersReducedMotion()) return
    let raf = 0
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) * strength
      const dy = (e.clientY - (r.top + r.height / 2)) * strength
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => (el.style.transform = `translate(${dx}px, ${dy}px)`))
    }
    const leave = () => {
      cancelAnimationFrame(raf)
      el.style.transform = ''
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      cancelAnimationFrame(raf)
    }
  }, [strength])
  return (
    <span ref={ref} style={{ display: 'inline-block', transition: 'transform 400ms var(--ease-out)' }}>
      {children}
    </span>
  )
}
