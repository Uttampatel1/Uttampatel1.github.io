import { useId, useRef, useState, type CSSProperties } from 'react'
import type { Project } from '../../data/projects'
import { categories } from '../../design/tokens'
import { getDeviceTier } from '../../hooks/useDeviceTier'
import { Ticker } from '../ui/Ticker'
import { Todo } from '../ui/Todo'
import { TokenStream } from '../ui/TokenStream'
import styles from './ModelCard.module.css'

const pad = (k: string) => k.padEnd(9, ' ')

function readoutText(p: Project) {
  const lines = [
    `> inference(model="${p.id}")`,
    `${pad('STACK')}${p.stack.length ? p.stack.join(' · ') : 'TODO'}`,
    `${pad('STATUS')}${p.status ?? 'TODO'}`,
    `${pad('ROLE')}${p.role ?? 'TODO'}`,
    `${pad('METRIC')}${p.metric ? `${p.metric.value} ${p.metric.label}` : 'TODO: add a real metric'}`,
    `${pad('CLASS')}${categories[p.category].label}`,
  ]
  // production builds drop the unfilled fields instead of showing TODO
  return (import.meta.env.DEV ? lines : lines.filter((l) => !l.includes('TODO'))).join('\n')
}

// Signature 3: each project is a model card. Hover (or "Run inference" on touch / keyboard) flips it
// into an inference readout that streams in token by token, with the real elapsed time at the end.
export function ModelCard({ project: p, index }: { project: Project; index: number }) {
  const [on, setOn] = useState(false)
  const [elapsed, setElapsed] = useState<number | null>(null)
  const started = useRef(0)
  const id = useId()
  const fine = getDeviceTier().finePointer
  const text = readoutText(p)

  const flip = (v: boolean) => {
    setOn(v)
    if (v) {
      started.current = performance.now()
      setElapsed(null)
    }
  }

  return (
    <article
      className={`${styles.card} ${on ? styles.on : ''}`}
      style={{ '--cat': `var(--cat-${p.category})` } as CSSProperties}
      onPointerEnter={(e) => fine && e.pointerType === 'mouse' && flip(true)}
      onPointerLeave={(e) => fine && e.pointerType === 'mouse' && flip(false)}
      aria-labelledby={`${id}-t`}
    >
      <div className={styles.inner}>
        <div className={styles.front}>
          <div className={`mono ${styles.top}`}>
            <span aria-hidden="true">MODEL {String(index + 1).padStart(2, '0')}</span>
            <span className={styles.chip}>
              <i aria-hidden="true" />
              {categories[p.category].short}
            </span>
          </div>
          <h3 id={`${id}-t`} className={styles.title}>
            {p.href ? (
              <a href={p.href} target="_blank" rel="noreferrer" className="u-link">
                {p.title}
              </a>
            ) : (
              p.title
            )}
          </h3>
          <p className={styles.summary}>{p.summary}</p>
          <div className={styles.metric}>
            {p.metric ? (
              <>
                <Ticker value={p.metric.value} className={`display ${styles.metricV}`} />
                <span className={`mono ${styles.metricL}`}>{p.metric.label}</span>
              </>
            ) : (
              <Todo>real metric for “{p.title}”</Todo>
            )}
          </div>
        </div>

        <div className={styles.back} id={`${id}-r`}>
          <pre className={`${styles.readout}`}>
            <TokenStream text={text} run={on} msPerToken={16} caret onDone={() => setElapsed(performance.now() - started.current)} />
          </pre>
          <p className={`mono ${styles.done}`} aria-hidden="true">
            {elapsed != null ? `✓ ${text.split(/\s+/).length} tokens · ${(elapsed / 1000).toFixed(2)}s` : on ? 'streaming…' : ''}
          </p>
        </div>
      </div>

      <button
        type="button"
        className={`mono ${styles.toggle}`}
        aria-expanded={on}
        aria-controls={`${id}-r`}
        onClick={() => flip(!on)}
      >
        {on ? 'Close readout' : 'Run inference'}
        <span aria-hidden="true">{on ? '×' : '▸'}</span>
      </button>
    </article>
  )
}
