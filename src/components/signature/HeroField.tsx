import { useEffect, useRef, useState } from 'react'
import { profile } from '../../content'
import { slice as sliceLabel } from '../../design/tokens'
import { pointer } from '../../hooks/useCursor'
import { getDeviceTier } from '../../hooks/useDeviceTier'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { readout, useWindowLevel } from '../../hooks/useWindowLevel'
import { Todo } from '../ui/Todo'
import { HeroName } from './HeroName'
import styles from './HeroField.module.css'

const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.')
const fmt = (n: number) => n.toFixed(2)

// Signature 1: a live signal field. Topographic contours of an evolving surface; the pointer
// probes it (the lines bend around it) and its height shifts the contour level. On touch the
// level follows scroll and tilt. A small instrument readout reports the probe.
export function HeroField() {
  const host = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const sliceText = useRef<HTMLSpanElement>(null)
  const probeText = useRef<HTMLSpanElement>(null)
  const levelText = useRef<HTMLSpanElement>(null)
  const [glFailed, setGlFailed] = useState(false)
  const reduce = useReducedMotion()
  const wl = useWindowLevel()
  const ctl = useRef<{ redraw: () => void; stop: () => void } | null>(null)
  const touch = getDeviceTier().touch

  // WebGL starts only after first paint so the name stays the LCP element.
  useEffect(() => {
    let cancelled = false
    let lastSlice = -1
    const idle = (cb: () => void) =>
      typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(cb, { timeout: 600 }) : setTimeout(cb, 120)
    idle(async () => {
      const { startField } = await import('./fieldRenderer')
      if (cancelled || !canvas.current || !host.current) return
      try {
        ctl.current = startField({
          canvas: canvas.current,
          host: host.current,
          reduce,
          onLevel: (level) => {
            const n = Math.round(1 + Math.min(1, Math.max(0, level)) * 127)
            if (n !== lastSlice && sliceText.current) {
              lastSlice = n
              sliceText.current.textContent = sliceLabel(n)
            }
            if (levelText.current) levelText.current.textContent = `LEVEL ${fmt(level)}`
            const r = host.current?.getBoundingClientRect()
            if (probeText.current && r && pointer.active) {
              probeText.current.textContent = `PROBE ${fmt((pointer.x - r.left) / r.width)}, ${fmt(1 - (pointer.y - r.top) / r.height)}`
            }
          },
        })
        if (!ctl.current) setGlFailed(true)
      } catch {
        setGlFailed(true)
      }
    })
    return () => {
      cancelled = true
      ctl.current?.stop()
      ctl.current = null
    }
  }, [reduce])

  // reduced motion renders a single frame; redraw it when the dial changes
  useEffect(() => {
    ctl.current?.redraw()
  }, [wl])

  const { W, L } = readout(wl)

  return (
    <section ref={host} id="top" className={styles.hero} aria-label="Introduction" tabIndex={-1}>
      <div
        className={`${styles.canvasWrap} ${glFailed ? styles.fallback : ''}`}
        role="img"
        aria-label="A procedurally drawn topographic field of contour lines that slowly shifts. Moving the pointer bends the lines around it and changes the contour level."
      >
        <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />
      </div>

      <div className={`wrap ${styles.grid}`}>
        <div className={`mono ${styles.metaTL}`} aria-hidden="true">
          <span>PT · {profile.name.toUpperCase()}</span>
          <span>STUDY · PORTFOLIO</span>
          <span>FIELD · PROCEDURAL · 16 ISOLINES</span>
        </div>
        <div className={`mono ${styles.metaTR}`} aria-hidden="true">
          <span>{today}</span>
          <span>{profile.title.toUpperCase()}</span>
        </div>

        <div className={styles.copy}>
          <p className={`mono ${styles.role}`}>{profile.title}</p>
          <HeroName text={profile.name} />
          <p className={`display ${styles.tagline}`}>{profile.tagline}</p>
          <p className={`mono ${styles.strip}`}>
            Medical Imaging AI · Brain MRI Segmentation{profile.yearsExperience && ` · ${profile.yearsExperience}+ Years`}
          </p>
          {!profile.yearsExperience && <Todo>years of experience in content.ts → profile.yearsExperience</Todo>}
          <a className={`mono ${styles.skip}`} href="#work">
            Skip to work <span aria-hidden="true">↓</span>
          </a>
        </div>

        <div className={`mono ${styles.readout}`} aria-hidden="true">
          {!touch && <span ref={probeText}>PROBE —, —</span>}
          <span ref={levelText}>LEVEL 0.50</span>
          <span>CONTRAST {fmt(wl.window / 100)}</span>
        </div>

        <div className={`mono ${styles.metaBL}`} aria-hidden="true">
          <span ref={sliceText}>{sliceLabel(64)}</span>
          <span>
            W {W} · L {L}
          </span>
          <span className={styles.hint}>{touch ? 'Scroll or tilt to shift the field' : 'Move pointer to probe the field'}</span>
        </div>
      </div>
    </section>
  )
}
