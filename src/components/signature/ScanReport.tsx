import { useEffect, useRef, useState } from 'react'
import { education, experience, profile } from '../../content'
import { useInView } from '../../hooks/useInView'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import { Todo } from '../ui/Todo'
import styles from './ScanReport.module.css'

const CHARS_PER_MS = 0.7 // fast: ~300 characters in under half a second

// Typewriter that never hides content from assistive tech or shifts layout: the real text is
// laid out (transparent) while a typed copy is drawn over it.
function Typed({ text, at, run }: { text: string; at: number; run: boolean }) {
  const [n, setN] = useState(0)
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!run) return
    if (prefersReducedMotion()) {
      setDone(true)
      return
    }
    let raf = 0
    const t0 = performance.now() + at
    const tick = (now: number) => {
      const c = Math.max(0, Math.floor((now - t0) * CHARS_PER_MS))
      setN(Math.min(text.length, c))
      if (c < text.length) raf = requestAnimationFrame(tick)
      else setDone(true)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [run, at, text])

  if (done) return <span className={styles.typed}>{text}</span>
  return (
    <span className={styles.typed}>
      <span className={styles.ghost}>{text}</span>
      <span className={styles.overlay} aria-hidden="true">
        {text.slice(0, n)}
        {run && n < text.length && <span className={styles.caret} />}
      </span>
    </span>
  )
}

// Signature 7: experience as a radiology report — HISTORY, FINDINGS, IMPRESSION.
export function ScanReport() {
  const ref = useRef<HTMLDivElement>(null)
  const run = useInView(ref, { threshold: 0.2, once: true })
  let clock = 0
  const next = (text: string) => {
    const at = clock
    clock += text.length / CHARS_PER_MS + 60
    return { text, at, run }
  }

  const filledJobs = experience.filter((e) => e.role || e.org)
  const edu = education.map((e) => [e.degree, e.school, e.years].filter(Boolean).join(', '))

  return (
    <div ref={ref} className={styles.report}>
      <dl className={`mono ${styles.header}`}>
        <div>
          <dt>Exam</dt>
          <dd>Professional history</dd>
        </div>
        <div>
          <dt>Subject</dt>
          <dd>{profile.name}</dd>
        </div>
        <div>
          <dt>Modality</dt>
          <dd>{profile.title}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd className="accent">Final</dd>
        </div>
      </dl>

      <section id="education" className={styles.block} aria-labelledby="r-history" tabIndex={-1}>
        <h3 id="r-history" className={`mono ${styles.label}`}>History</h3>
        <div className={styles.content}>
          {edu.map((line) => (
            <p key={line}>
              <Typed {...next(line)} />
            </p>
          ))}
          {education.some((e) => !e.school || !e.years) && <Todo>college / university name and years in content.ts → education</Todo>}
        </div>
      </section>

      <section className={styles.block} aria-labelledby="r-findings">
        <h3 id="r-findings" className={`mono ${styles.label}`}>Findings</h3>
        <div className={styles.content}>
          {filledJobs.length === 0 && <Todo>add your roles in content.ts → experience (title, company, years, 2–4 notes)</Todo>}
          <ol className={styles.findings}>
            {filledJobs.map((job, i) => (
              <li key={i}>
                <p className={styles.job}>
                  <span className="mono muted">{String(i + 1).padStart(2, '0')}.</span>{' '}
                  <Typed {...next(`${job.role}${job.org ? ` — ${job.org}` : ''}`)} />
                  {job.years && <span className={`mono ${styles.years}`}>{job.years}</span>}
                </p>
                {job.notes.map((note) => (
                  <p key={note} className={styles.note}>
                    <Typed {...next(note)} />
                  </p>
                ))}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.block} aria-labelledby="r-impression">
        <h3 id="r-impression" className={`mono ${styles.label}`}>Impression</h3>
        <div className={styles.content}>
          <p className={styles.impression}>
            <Typed {...next(profile.intro)} />
          </p>
        </div>
      </section>

      <p className={`mono ${styles.sign}`}>Electronically signed · {profile.name}</p>
    </div>
  )
}
