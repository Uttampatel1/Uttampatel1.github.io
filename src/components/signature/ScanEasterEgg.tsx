import { useCallback, useRef, useState } from 'react'
import { useEasterEgg } from '../../hooks/useEasterEgg'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { getWindowLevel, setWindowLevel } from '../../hooks/useWindowLevel'
import styles from './ScanOverlays.module.css'

const HOLD = 3000
const SWEEP = 900

// Signature 8: the Konami code, or typing "scan", runs a full-page scanline sweep that
// develops the whole site as its negative film for three seconds, then restores the W/L setting.
export function ScanEasterEgg() {
  const line = useRef<HTMLDivElement>(null)
  const [msg, setMsg] = useState('')
  const busy = useRef(false)

  const run = useCallback(() => {
    if (busy.current) return
    busy.current = true
    const { level, window: win } = getWindowLevel()
    setWindowLevel(100 - level, win) // flips the film (as a scanline wipe where supported)
    setMsg('Scan mode: the page is shown as its negative for three seconds.')
    if (!prefersReducedMotion() && line.current) {
      line.current.animate(
        [
          { transform: 'translateY(0)', opacity: 1 },
          { transform: 'translateY(100vh)', opacity: 1 },
        ],
        { duration: SWEEP, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' },
      )
    }
    window.setTimeout(() => {
      setWindowLevel(level, win)
      setMsg('')
      busy.current = false
    }, HOLD)
  }, [])

  useEasterEgg(run)

  return (
    <>
      <div ref={line} className={styles.eggLine} aria-hidden="true" />
      <p className="sr-only" aria-live="polite">
        {msg}
      </p>
    </>
  )
}
