import { useEffect, useId, useMemo, useRef } from 'react'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import styles from './DataStreamWipe.module.css'

const GLYPHS = '01{}[]<>/=+-*.:;#%&ΣλΔ∂∇θ'

// Section transition: a thin line of flowing characters sweeps across the layer's top rule
// and draws it in behind itself. Layers already on screen (or reduced motion) skip it: the rule
// is simply there.
export function DataStreamWipe() {
  const ref = useRef<HTMLDivElement>(null)
  // seeded from useId so the prerendered HTML and the client render agree
  const id = useId()
  const text = useMemo(() => {
    let seed = 7
    for (const ch of id) seed = (seed * 31 + ch.charCodeAt(0)) % 2147483647
    return Array.from({ length: 64 }, () => {
      seed = (seed * 16807) % 2147483647
      return GLYPHS[seed % GLYPHS.length]
    }).join('')
  }, [id])

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    if (el.getBoundingClientRect().top < window.innerHeight) return
    el.classList.add(styles.armed)
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        el.classList.add(styles.run)
        io.disconnect()
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={styles.wipe} aria-hidden="true">
      <span className={styles.rule} />
      <span className={`mono ${styles.stream}`}>{text}</span>
    </div>
  )
}
