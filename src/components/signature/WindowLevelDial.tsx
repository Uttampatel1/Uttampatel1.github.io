import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { windowLevel as WL } from '../../design/tokens'
import { readout, resetWindowLevel, setWindowLevel, useWindowLevel } from '../../hooks/useWindowLevel'
import styles from './WindowLevelDial.module.css'

// Signature 5: the theme switch is a radiology window/level control.
// Drag like a viewer: vertical = Level (brightness; past the midpoint the film inverts to light),
// horizontal = Window (contrast). Keyboard: ↑/↓ level, ←/→ window, Home resets. Double-click resets.
export function WindowLevelDial() {
  const wl = useWindowLevel()
  const drag = useRef<{ x: number; y: number; level: number; window: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const { W, L } = readout(wl)
  const angle = -135 + (wl.level / 100) * 270

  const down = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, level: wl.level, window: wl.window }
    setDragging(true)
  }
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    setWindowLevel(d.level + (d.y - e.clientY) * 0.45, d.window + (e.clientX - d.x) * 0.45)
  }
  const up = () => {
    drag.current = null
    setDragging(false)
  }
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 4
    const map: Record<string, [number, number]> = {
      ArrowUp: [step, 0],
      ArrowRight: [0, step],
      ArrowDown: [-step, 0],
      ArrowLeft: [0, -step],
      PageUp: [25, 0],
      PageDown: [-25, 0],
    }
    if (e.key === 'Home') {
      e.preventDefault()
      resetWindowLevel()
    } else if (e.key === 'End') {
      e.preventDefault()
      setWindowLevel(wl.level < WL.filmThreshold ? 80 : WL.defaultLevel, wl.window)
    } else if (map[e.key]) {
      e.preventDefault()
      setWindowLevel(wl.level + map[e.key][0], wl.window + map[e.key][1])
    }
  }

  return (
    <div className={styles.wrap}>
      <div
        className={`${styles.dial} ${dragging ? styles.dragging : ''}`}
        role="slider"
        tabIndex={0}
        aria-label="Window and level: display brightness and contrast"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(wl.level)}
        aria-valuetext={`Level ${L}, window ${W}, ${wl.film} film. Up and down change brightness, left and right change contrast.`}
        aria-describedby="wl-help"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={key}
        onDoubleClick={resetWindowLevel}
        data-cursor
      >
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="18" className={styles.track} />
          {Array.from({ length: 13 }, (_, i) => {
            const a = ((-135 + i * 22.5 - 90) * Math.PI) / 180
            return <line key={i} x1={20 + Math.cos(a) * 15} y1={20 + Math.sin(a) * 15} x2={20 + Math.cos(a) * 17.5} y2={20 + Math.sin(a) * 17.5} className={styles.tick} />
          })}
          {/* half-filled disc: the "film" the site is currently on */}
          <circle cx="20" cy="20" r="10" className={styles.disc} />
          <path d="M20,10 a10,10 0 0,1 0,20 Z" className={styles.half} />
          <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '20px 20px' }} className={styles.needle}>
            <line x1="20" y1="20" x2="20" y2="4.5" />
          </g>
        </svg>
      </div>
      <span className={`mono ${styles.readout}`} aria-hidden="true">
        <span>W {String(W).padStart(3, '0')}</span>
        <span>L {String(L).padStart(3, ' ')}</span>
      </span>
      <span id="wl-help" className="sr-only">
        Drag up or down to change brightness, left or right to change contrast. Press Home to reset.
      </span>
    </div>
  )
}
