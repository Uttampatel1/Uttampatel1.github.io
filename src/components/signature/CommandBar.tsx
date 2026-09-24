import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ask, suggestions, type Answer } from '../../data/commandBar'
import { scrollToEl } from '../../lib/scroll'
import { TokenStream } from '../ui/TokenStream'
import styles from './CommandBar.module.css'

type Turn = { id: number; q: string; a: Answer; ms: number }

// Signature 4: "Ask my portfolio". A terminal-style prompt in a native modal <dialog> (focus trap,
// Escape and an inert page for free). Answers are pre-written and matched by keyword, then streamed.
export default function CommandBar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const log = useRef<HTMLDivElement>(null)
  const [turns, setTurns] = useState<Turn[]>([])
  const [value, setValue] = useState('')
  const [streaming, setStreaming] = useState(false)

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (open && !d.open) {
      d.showModal()
      document.documentElement.classList.add('dialog-open')
      window.dispatchEvent(new Event('attn-wake'))
      requestAnimationFrame(() => input.current?.focus())
    } else if (!open && d.open) d.close()
  }, [open])

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight })
  })

  const submit = (q: string) => {
    q = q.trim()
    if (!q || streaming) return
    const t0 = performance.now()
    const a = ask(q)
    setTurns((ts) => [...ts.slice(-5), { id: Date.now(), q, a, ms: Math.max(1, Math.round(performance.now() - t0)) }])
    setValue('')
    setStreaming(true)
  }

  const go = (href: string) => {
    const [hash, qs] = href.split('?')
    const cat = new URLSearchParams(qs ?? '').get('cat')
    onClose()
    if (cat) window.dispatchEvent(new CustomEvent('work-filter', { detail: cat }))
    const el = document.querySelector<HTMLElement>(hash)
    if (el) {
      requestAnimationFrame(() => {
        scrollToEl(el)
        el.focus({ preventScroll: true })
      })
    }
  }

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby="ask-title"
      onClose={() => {
        document.documentElement.classList.remove('dialog-open')
        onClose()
      }}
      onClick={(e) => e.target === dialog.current && onClose()}
    >
      <div className={styles.panel}>
        <div className={`mono ${styles.head}`}>
          <span id="ask-title">ask(portfolio) · keyword model · no network calls</span>
          <button type="button" className={`mono ${styles.close}`} onClick={onClose}>
            Esc <span className="sr-only">Close</span>
          </button>
        </div>

        <div ref={log} className={styles.log} aria-live="polite">
          {turns.length === 0 && (
            <p className={`mono ${styles.hint}`}>
              Ask about what I build, the stack, projects, or hiring. Answers are pre-written, matched by keyword and streamed.
            </p>
          )}
          {turns.map((t, i) => (
            <div key={t.id} className={styles.turn}>
              <p className={`mono ${styles.q}`}>
                <span aria-hidden="true">&gt; </span>
                {t.q}
              </p>
              <p className={styles.a}>
                <TokenStream
                  text={t.a.answer}
                  run
                  msPerToken={26}
                  caret
                  onDone={i === turns.length - 1 ? () => setStreaming(false) : undefined}
                />
              </p>
              <p className={`mono ${styles.meta}`} aria-hidden="true">
                match · {t.a.id} · {t.ms}ms
              </p>
              {t.a.action && (
                <button type="button" className={`mono u-link ${styles.action}`} onClick={() => go(t.a.action!.href)}>
                  {t.a.action.label} →
                </button>
              )}
            </div>
          ))}
        </div>

        <form
          className={styles.form}
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
            submit(value)
          }}
        >
          <label htmlFor="ask-input" className="sr-only">
            Ask a question about Uttam’s work
          </label>
          <span className={`mono ${styles.prompt}`} aria-hidden="true">
            &gt;
          </span>
          <input
            ref={input}
            id="ask-input"
            className={styles.input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="what do you build?"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="send"
          />
          <button type="submit" className={`mono ${styles.send}`} disabled={!value.trim() || streaming}>
            Run ⏎
          </button>
        </form>

        <div className={styles.chips} role="group" aria-label="Suggested questions">
          {suggestions.map((s) => (
            <button key={s} type="button" className={`mono ${styles.chip}`} onClick={() => submit(s)} disabled={streaming}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </dialog>
  )
}
