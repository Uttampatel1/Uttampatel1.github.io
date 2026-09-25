import { useEffect, useRef, useState } from 'react'
import { outputs, profile } from '../../data/profile'
import { layerLabel } from '../../design/tokens'
import { getDeviceTier } from '../../hooks/useDeviceTier'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useTemperature } from '../../hooks/useTemperature'
import { Magnetic } from '../ui/Magnetic'
import { Todo } from '../ui/Todo'
import styles from './HeroNetwork.module.css'

const f2 = (n: number) => n.toFixed(2)

// Signature 1: a live neural network. Particles self-assemble into a layered network; the pointer
// (touch: scroll + tilt) is the input signal and activations ripple through the layers toward it.
// The name streams in token by token like model output. All copy is real DOM text, painted first.
export function HeroNetwork() {
  const host = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const readout = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  const temp = useTemperature()
  const ctl = useRef<{ retheme: () => void; stop: () => void } | null>(null)
  const [failed, setFailed] = useState(false)
  const [touch, setTouch] = useState(false)
  useEffect(() => setTouch(getDeviceTier().touch), [])

  useEffect(() => {
    let cancelled = false
    const idle = (cb: () => void) =>
      typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(cb, { timeout: 700 }) : setTimeout(cb, 150)
    idle(async () => {
      const { startNetwork } = await import('./networkRenderer')
      if (cancelled || !canvas.current || !host.current) return
      try {
        ctl.current = startNetwork({
          canvas: canvas.current,
          host: host.current,
          reduce,
          onReadout: ({ x, y, act, ms, pulses }) => {
            if (readout.current)
              readout.current.textContent = `x=[${f2(x)}, ${f2(y)}] · ŷ=${f2(act)} · ${pulses.toString().padStart(3, '0')} pulses · ${ms.toFixed(1)}ms`
          },
        })
        if (!ctl.current) setFailed(true)
      } catch {
        setFailed(true)
      }
    })
    return () => {
      cancelled = true
      ctl.current?.stop()
      ctl.current = null
    }
  }, [reduce])

  useEffect(() => {
    ctl.current?.retheme()
  }, [temp.theme, temp.t])

  return (
    <section ref={host} id="top" className={styles.hero} aria-labelledby="hero-name" tabIndex={-1}>
      <div
        className={`${styles.canvasWrap} ${failed ? styles.fallback : ''}`}
        role="img"
        aria-label="A neural network drawn from particles: layers of nodes joined by faint connections. Moving the pointer, or scrolling and tilting on a phone, sends a signal through it, and the nodes nearest the signal light up layer by layer."
      >
        <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />
      </div>

      <div className={`wrap ${styles.grid}`}>
        <div className={`mono ${styles.metaTL}`} aria-hidden="true">
          <span className={styles.layerName}>{layerLabel('top')}</span>
          <span>model · uttam-patel-v{new Date().getFullYear() % 100}</span>
        </div>
        <div className={`mono ${styles.metaTR}`} aria-hidden="true">
          <span>{profile.location}</span>
          <span>status · accepting requests</span>
        </div>

        <div className={styles.copy}>
          <p className={`mono ${styles.prompt}`}>
            <span aria-hidden="true">&gt; </span>generate(identity) <span className="sr-only">→</span>
          </p>
          <h1 id="hero-name" className={`display ${styles.name}`} aria-label={profile.name}>
            {profile.nameTokens.map((tok, i) => (
              <span key={i} className={styles.token} style={{ animationDelay: `${260 + i * 120}ms` }} aria-hidden="true">
                {tok}
              </span>
            ))}
            <span className={styles.caret} aria-hidden="true" />
          </h1>
          <p className={styles.role}>
            <span className="mono">{profile.role}</span>
          </p>
          <p className={`display ${styles.tagline}`}>
            I build AI <em>that ships.</em>
          </p>

          <ul className={styles.outputs} aria-label="What I build">
            {outputs.map((o, i) => (
              <li key={o.k} style={{ animationDelay: `${1150 + i * 70}ms` }}>
                <span className={`mono ${styles.outIdx}`} aria-hidden="true">
                  y{i}
                </span>
                <b>{o.k}</b>
                <span className={styles.outV}>{o.v}</span>
              </li>
            ))}
          </ul>

          <div className={styles.ctas}>
            <Magnetic>
              <a className="btn btn-primary" href="#work">
                View the models <span className="arrow" aria-hidden="true">→</span>
              </a>
            </Magnetic>
            {profile.cvHref ? (
              <Magnetic>
                <a className="btn" href={profile.cvHref} download>
                  Download CV <span className="arrow" aria-hidden="true">↓</span>
                </a>
              </Magnetic>
            ) : (
              <Todo>CV file → profile.cvHref</Todo>
            )}
            <a className={`mono u-link ${styles.skip}`} href="#work">
              Skip to work
            </a>
          </div>
        </div>

        <div className={`mono ${styles.metaBL}`} aria-hidden="true">
          <span>{touch ? 'input: scroll / tilt' : 'input: pointer'}</span>
          {profile.yearsExperience ? <span>{profile.yearsExperience}+ yrs in production</span> : null}
        </div>
        <div className={`mono ${styles.metaBR}`} aria-hidden="true">
          <span ref={readout}>x=[—, —] · ŷ=— · 000 pulses</span>
        </div>
        {!profile.yearsExperience && (
          <div className={styles.todoSlot}>
            <Todo>years of experience → profile.yearsExperience</Todo>
          </div>
        )}
      </div>
    </section>
  )
}
