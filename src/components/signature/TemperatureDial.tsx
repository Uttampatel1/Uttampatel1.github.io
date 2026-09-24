import { useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { temperature as T } from '../../design/tokens'
import { setTemperature, useTemperature } from '../../hooks/useTemperature'
import styles from './TemperatureDial.module.css'

const SWEEP = 270 // degrees of travel, from -135° (0.0) to +135° (1.0)
const TICKS = 11

const describe = (t: number) =>
  t < 0.25 ? 'crisp, light, near-static' : t < T.threshold ? 'light, calm' : t < 0.8 ? 'dark, expressive' : 'dark, maximum grain and motion'

// Signature 5: the theme control is a sampling temperature. Drag the dial (or use arrow keys):
// low is crisp paper, high is dark and expressive. Crossing 0.5 flips light/dark.
export function TemperatureDial() {
  const { t, theme } = useTemperature()
  const knob = useRef<HTMLDivElement>(null)
  const angle = -SWEEP / 2 + t * SWEEP

  const fromPointer = (e: PointerEvent) => {
    const r = knob.current!.getBoundingClientRect()
    const a = (Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180) / Math.PI
    const clamped = Math.max(-SWEEP / 2, Math.min(SWEEP / 2, a))
    setTemperature(Math.round(((clamped + SWEEP / 2) / SWEEP) / 0.01) * 0.01)
  }

  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey || e.key.startsWith('Page') ? 0.2 : T.step
    const map: Record<string, number> = {
      ArrowRight: t + step,
      ArrowUp: t + step,
      PageUp: t + step,
      ArrowLeft: t - step,
      ArrowDown: t - step,
      PageDown: t - step,
      Home: 0,
      End: 1,
    }
    if (e.key in map) {
      e.preventDefault()
      setTemperature(map[e.key])
    }
  }

  return (
    <div className={styles.wrap}>
      <div
        ref={knob}
        className={styles.dial}
        role="slider"
        tabIndex={0}
        aria-label="Temperature (theme)"
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={t}
        aria-valuetext={`${t.toFixed(2)}: ${theme} theme, ${describe(t)}`}
        onKeyDown={onKey}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          fromPointer(e)
        }}
        onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && fromPointer(e)}
        onDoubleClick={() => setTemperature(T.default)}
      >
        <svg viewBox="0 0 40 40" aria-hidden="true">
          {Array.from({ length: TICKS }, (_, i) => {
            const a = ((-SWEEP / 2 + (i / (TICKS - 1)) * SWEEP) * Math.PI) / 180
            const lit = i / (TICKS - 1) <= t + 1e-6
            return (
              <line
                key={i}
                x1={20 + Math.sin(a) * 16}
                y1={20 - Math.cos(a) * 16}
                x2={20 + Math.sin(a) * (i % 5 === 0 ? 19.5 : 18.5)}
                y2={20 - Math.cos(a) * (i % 5 === 0 ? 19.5 : 18.5)}
                className={lit ? styles.lit : styles.tick}
              />
            )
          })}
          <circle cx="20" cy="20" r="12" className={styles.body} />
          <line x1="20" y1="20" x2="20" y2="10" className={styles.needle} style={{ transform: `rotate(${angle}deg)` }} />
        </svg>
      </div>
      <span className={`mono ${styles.value}`} aria-hidden="true">
        <span className={styles.key}>temp</span>
        {t.toFixed(2)}
      </span>
    </div>
  )
}
