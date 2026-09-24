import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import styles from './HeroField.module.css'

const NOISE = '░▒▓█01<>/|=+*#%'

// The name "reconstructs" out of noise. Each letter box is sized by its real glyph from the
// first paint (no layout shift); a noise glyph sits over it and flickers until the letter locks.
export function HeroName({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    if (prefersReducedMotion()) {
      root.classList.add(styles.resolved)
      return
    }
    const letters = Array.from(root.querySelectorAll<HTMLElement>('[data-l]'))
    const lockAt = letters.map((_, i) => 260 + i * 70 + Math.random() * 260)
    const t0 = performance.now()
    let raf = 0
    let lastSwap = 0
    const tick = (now: number) => {
      const t = now - t0
      const swap = now - lastSwap > 55
      if (swap) lastSwap = now
      let pending = 0
      letters.forEach((el, i) => {
        if (t >= lockAt[i]) {
          el.classList.add(styles.locked)
          return
        }
        pending++
        if (swap) (el.lastElementChild as HTMLElement).textContent = NOISE[(Math.random() * NOISE.length) | 0]
      })
      if (pending) raf = requestAnimationFrame(tick)
      else root.classList.add(styles.resolved)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <h1 ref={ref} className={`display ${styles.name}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(' ').map((w, wi) => (
          <span key={wi} className={styles.word}>
            {[...w].map((ch, ci) => (
              <span key={ci} className={styles.letter} data-l>
                <span className={styles.glyph}>{ch}</span>
                <span className={styles.noise}>{NOISE[(wi * 7 + ci * 3) % NOISE.length]}</span>
              </span>
            ))}
          </span>
        ))}
      </span>
    </h1>
  )
}
