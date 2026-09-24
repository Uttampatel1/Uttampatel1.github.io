import { useEffect, useId, useMemo, useRef } from 'react'
import { epochs } from '../../data/experience'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { Todo } from '../ui/Todo'
import styles from './TrainingLog.module.css'

const W = 400
const H = 260
const N = 64

function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
}

// An illustrative loss curve (not data): exponential decay plus a little seeded noise.
function curve(offset: number, seed: number) {
  const r = rng(seed)
  return Array.from({ length: N }, (_, i) => {
    const x = i / (N - 1)
    const loss = 0.06 + offset + 0.86 * Math.exp(-3.4 * x) + (r() - 0.5) * 0.045 * (1 - x * 0.6)
    return [x * W, H - Math.min(1, loss) * H] as const
  })
}
const toPath = (pts: readonly (readonly [number, number])[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('')
const lossAt = (p: number) => 0.06 + 0.86 * Math.exp(-3.4 * p)

const pad2 = (n: number) => String(n).padStart(2, '0')

// Signature 7: experience as a training run. Each role is an EPOCH, each milestone a CHECKPOINT.
// The loss curve draws and descends as you scroll through the log (GSAP ScrollTrigger, scrubbed);
// log lines reveal fast, monospace, line by line.
export function TrainingLog() {
  const root = useRef<HTMLDivElement>(null)
  const reveal = useRef<SVGRectElement>(null)
  const clipId = 'loss' + useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const marker = useRef<SVGGElement>(null)
  const readout = useRef<HTMLSpanElement>(null)
  const trainPts = useMemo(() => curve(0, 5), [])
  const valPts = useMemo(() => curve(0.05, 9), [])

  useEffect(() => {
    const el = root.current
    if (!el) return
    const set = (p: number) => {
      reveal.current?.setAttribute('width', String(p * (W + 16)))
      const idx = Math.min(N - 1, Math.round(p * (N - 1)))
      const [x, y] = trainPts[idx]
      marker.current?.setAttribute('transform', `translate(${x} ${y})`)
      const epoch = Math.min(epochs.length, 1 + Math.floor(p * epochs.length))
      if (readout.current)
        readout.current.textContent = `epoch ${pad2(epoch)}/${pad2(epochs.length)} · step ${String(Math.round(p * 4096)).padStart(4, '0')} · loss ${lossAt(p).toFixed(3)}`
    }

    // log lines: arm the reveal only for blocks still below the fold
    const blocks = Array.from(el.querySelectorAll<HTMLElement>('[data-epoch]'))
    const reduce = prefersReducedMotion()
    let io: IntersectionObserver | undefined
    if (!reduce) {
      io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.setAttribute('data-in', '')
              io?.unobserve(e.target)
            }
          }),
        { rootMargin: '0px 0px -15% 0px' },
      )
      blocks.forEach((b) => {
        if (b.getBoundingClientRect().top > window.innerHeight) {
          b.setAttribute('data-armed', '')
          io!.observe(b)
        }
      })
    }

    if (reduce) {
      set(1)
      return () => io?.disconnect()
    }
    set(0)
    let kill: (() => void) | undefined
    let cancelled = false
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 75%',
        end: 'bottom 60%',
        scrub: 0.4,
        onUpdate: (self) => set(self.progress),
      })
      set(st.progress)
      kill = () => st.kill()
    })
    return () => {
      cancelled = true
      kill?.()
      io?.disconnect()
    }
  }, [trainPts])

  return (
    <div ref={root} className={styles.layout}>
      <figure className={styles.chart}>
        <div className={styles.sticky}>
          <div className={`mono ${styles.chartHead}`} aria-hidden="true">
            <span>loss</span>
            <span className={styles.legend}>
              <i className={styles.trainKey} /> train <i className={styles.valKey} /> val
            </span>
          </div>
          <svg viewBox={`-8 -8 ${W + 16} ${H + 16}`} className={styles.svg} role="img" aria-label="An illustrative training-loss curve that descends as you scroll through the experience log. Decorative, not real training data.">
            {[0.25, 0.5, 0.75].map((g) => (
              <line key={g} x1={0} x2={W} y1={H * g} y2={H * g} className={styles.grid} />
            ))}
            <line x1={0} x2={0} y1={0} y2={H} className={styles.axis} />
            <line x1={0} x2={W} y1={H} y2={H} className={styles.axis} />
            {epochs.map((_, i) => (
              <line key={i} x1={(W * (i + 1)) / epochs.length} x2={(W * (i + 1)) / epochs.length} y1={H - 6} y2={H} className={styles.axis} />
            ))}
            <clipPath id={clipId}>
              <rect ref={reveal} x={-8} y={-8} width={W + 16} height={H + 16} />
            </clipPath>
            <g clipPath={`url(#${clipId})`}>
              <path d={toPath(valPts)} className={styles.val} />
              <path d={toPath(trainPts)} className={styles.train} />
            </g>
            <g ref={marker} transform={`translate(${trainPts[0][0]} ${trainPts[0][1]})`}>
              <circle r="4" className={styles.marker} />
              <circle r="9" className={styles.markerRing} />
            </g>
          </svg>
          <p className={`mono ${styles.readout}`} aria-hidden="true">
            <span ref={readout}>epoch 01/{pad2(epochs.length)} · step 0000 · loss 0.920</span>
          </p>
          <figcaption className={`mono ${styles.caption}`}>Illustrative curve · the log on the right is the real record</figcaption>
        </div>
      </figure>

      <ol className={styles.log}>
        {epochs.map((ep, i) => (
          <li key={i} className={styles.epoch} data-epoch>
            <p className={`mono ${styles.line} ${styles.epochLine}`} style={{ '--i': 0 } as React.CSSProperties}>
              <span className={styles.tag}>
                [EPOCH {pad2(i + 1)}/{pad2(epochs.length)}]
              </span>
              <span className={styles.years}>{ep.years || '—'}</span>
            </p>
            <h3 className={`${styles.line} ${styles.role}`} style={{ '--i': 1 } as React.CSSProperties}>
              {ep.role}
              {ep.org && <span className="muted"> · {ep.org}</span>}
            </h3>
            {(!ep.org || !ep.years) && (
              <Todo>
                {!ep.org && 'organisation'}
                {!ep.org && !ep.years && ' + '}
                {!ep.years && 'years'} for “{ep.role}” in data/experience.ts
              </Todo>
            )}
            <ul className={styles.checkpoints}>
              {ep.checkpoints.map((c, j) => (
                <li key={j} className={`${styles.line} ${styles.cp}`} style={{ '--i': j + 2 } as React.CSSProperties}>
                  <span className={`mono ${styles.cpTag}`} aria-hidden="true">
                    {j === ep.checkpoints.length - 1 ? '└' : '├'} CKPT {pad2(i + 1)}.{j + 1}
                  </span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
            <p
              className={`mono ${styles.line} ${styles.saved}`}
              style={{ '--i': ep.checkpoints.length + 2 } as React.CSSProperties}
              aria-hidden="true"
            >
              ✓ checkpoint saved · epoch_{pad2(i + 1)}.ckpt
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}
