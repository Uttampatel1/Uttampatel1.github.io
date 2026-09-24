import { AnimatePresence, LazyMotion, m } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import { contactEndpoint, profile } from '../../data/profile'
import { ease } from '../../design/tokens'
import { Magnetic } from '../ui/Magnetic'
import styles from './CollaborateRequest.module.css'

const features = () => import('./motionFeatures').then((r) => r.default)
type Status = 'idle' | 'sending' | 'ok' | 'drafted' | 'error'

// Signature 9: contact as an API request. The form is a request builder for POST /collaborate with
// JSON-like keys. With `contactEndpoint` set it really POSTs JSON and answers "200 OK"; without one it
// opens a pre-filled email and says so ("302 → mail client") instead of pretending it was sent.
export function CollaborateRequest() {
  const [status, setStatus] = useState<Status>('idle')
  const [ms, setMs] = useState(0)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.reportValidity()) return
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>
    const t0 = performance.now()
    if (contactEndpoint) {
      setStatus('sending')
      try {
        const res = await fetch(contactEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        })
        setMs(Math.round(performance.now() - t0))
        setStatus(res.ok ? 'ok' : 'error')
        if (res.ok) form.reset()
      } catch {
        setStatus('error')
      }
      return
    }
    const body = `${data.message}\n\n— ${data.name} <${data.email}>`
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(`POST /collaborate · ${data.name}`)}&body=${encodeURIComponent(body)}`
    setStatus('drafted')
  }

  const done = status === 'ok' || status === 'drafted'

  return (
    <LazyMotion features={features} strict>
      <div className={styles.builder}>
        <div className={`mono ${styles.bar}`}>
          <span className={styles.method}>POST</span>
          <span className={styles.url}>/collaborate</span>
          <span className={styles.ct} aria-hidden="true">
            application/json
          </span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <m.div
              key="done"
              className={styles.response}
              initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
              animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
              transition={{ duration: 0.6, ease: ease.out }}
              role="status"
            >
              {status === 'ok' ? (
                <>
                  <p className={`mono ${styles.code}`}>
                    <span className={styles.okDot} aria-hidden="true" /> 200 OK <span className="muted">· {ms}ms</span>
                  </p>
                  <p className={`display ${styles.respTitle}`}>Response expected within 24h.</p>
                </>
              ) : (
                <>
                  <p className={`mono ${styles.code}`}>
                    <span className={styles.okDot} aria-hidden="true" /> 302 Found <span className="muted">· location: mail client</span>
                  </p>
                  <p className={`display ${styles.respTitle}`}>Draft opened in your email app.</p>
                  <p className={styles.respSub}>Hit send there to complete the request. Response expected within 24h.</p>
                </>
              )}
              <button type="button" className={`mono u-link ${styles.again}`} onClick={() => setStatus('idle')}>
                New request
              </button>
            </m.div>
          ) : (
            <m.form key="form" className={styles.form} onSubmit={submit} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <p className={`mono ${styles.brace}`} aria-hidden="true">
                {'{'}
              </p>
              <label className={styles.row}>
                <span className={`mono ${styles.key}`}>
                  "name"<span aria-hidden="true">:</span>
                </span>
                <input name="name" autoComplete="name" required placeholder='"Ada Lovelace"' />
              </label>
              <label className={styles.row}>
                <span className={`mono ${styles.key}`}>
                  "email"<span aria-hidden="true">:</span>
                </span>
                <input name="email" type="email" autoComplete="email" required placeholder='"you@company.com"' />
              </label>
              <label className={`${styles.row} ${styles.rowTall}`}>
                <span className={`mono ${styles.key}`}>
                  "message"<span aria-hidden="true">:</span>
                </span>
                <textarea name="message" rows={5} required placeholder='"What are you building?"' />
              </label>
              <p className={`mono ${styles.brace}`} aria-hidden="true">
                {'}'}
              </p>
              <div className={styles.actions}>
                <Magnetic>
                  <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                    {status === 'sending' ? 'Sending…' : 'Send request'} <span className="arrow" aria-hidden="true">⏎</span>
                  </button>
                </Magnetic>
                {status === 'error' && (
                  <p role="alert" className={`mono ${styles.error}`}>
                    500 · That didn’t go through. Email <a href={`mailto:${profile.email}`}>{profile.email}</a> directly.
                  </p>
                )}
              </div>
            </m.form>
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  )
}
