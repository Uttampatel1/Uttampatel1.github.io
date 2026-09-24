import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'

// Number ticker: counts the numeric part of a value ("23%", "99.2%", "10×") up from zero the
// first time it scrolls into view. Non-numeric values render as-is.
export function Ticker({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const match = value.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/)

  useEffect(() => {
    const el = ref.current
    if (!el || !match || prefersReducedMotion()) return
    const [, pre, num, post] = match
    const target = parseFloat(num)
    const decimals = num.includes('.') ? num.split('.')[1].length : 0
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / 900)
        const eased = 1 - Math.pow(1 - p, 4)
        el.textContent = `${pre}${(target * eased).toFixed(decimals)}${post}`
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <span className={className}>
      <span className="sr-only">{value}</span>
      <span ref={ref} aria-hidden="true">
        {value}
      </span>
    </span>
  )
}
