import { AnimatePresence, LazyMotion, m } from 'framer-motion'
import { useId, useState, type FormEvent } from 'react'
import { contactEndpoint, profile } from '../../content'
import { Magnetic } from '../ui/Magnetic'
import styles from './ConsultForm.module.css'

const features = () => import('./motionFeatures').then((r) => r.default)
type Status = 'idle' | 'sending' | 'received' | 'drafted' | 'error'

// Signature 9: contact as a referral slip. With `contactEndpoint` set it posts there and
// confirms "Referral received"; without one it opens a pre-filled email (and says so honestly).
export function ConsultForm() {
  const id = useId()
  const [status, setStatus] = useState<Status>('idle')
  const [urgency, setUrgency] = useState('Routine')
  const ref = `REF-${new Date().getFullYear()}-${id.replace(/\W/g, '').slice(-4).toUpperCase().padStart(4, '0')}`

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.reportValidity()) return
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>
    if (contactEndpoint) {
      setStatus('sending')
      try {
        const res = await fetch(contactEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ ...data, reference: ref }),
        })
        setStatus(res.ok ? 'received' : 'error')
        if (res.ok) form.reset()
      } catch {
        setStatus('error')
      }
      return
    }
    const body = [
      `Referring party: ${data.name}`,
      `Institution: ${data.org || '—'}`,
      `Reply to: ${data.email}`,
      `Priority: ${data.urgency}`,
      '',
      data.question,
    ].join('\n')
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(`Consult request ${ref}`)}&body=${encodeURIComponent(body)}`
    setStatus('drafted')
  }

  const done = status === 'received' || status === 'drafted'

  return (
    <LazyMotion features={features} strict>
      <div className={styles.slip}>
        <div className={`mono ${styles.slipHead}`} aria-hidden="true">
          <span>Referral / consult request</span>
          <span>{ref}</span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <m.div
              key="done"
              className={styles.done}
              initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
              animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              role="status"
            >
              {status === 'received' ? (
                <>
                  <p className={`display ${styles.doneTitle}`}>Referral received.</p>
                  <p className={styles.doneSub}>Scheduled for review.</p>
                </>
              ) : (
                <>
                  <p className={`display ${styles.doneTitle}`}>Referral drafted.</p>
                  <p className={styles.doneSub}>It is open in your email app. Send it from there to complete the referral.</p>
                </>
              )}
              <p className={`mono muted ${styles.doneRef}`}>{ref}</p>
              <button type="button" className={`mono ${styles.again}`} onClick={() => setStatus('idle')}>
                New referral
              </button>
            </m.div>
          ) : (
            <m.form key="form" className={styles.form} onSubmit={submit} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} noValidate={false}>
              <label className={styles.field}>
                <span className="mono">Referring party</span>
                <input name="name" autoComplete="name" required />
              </label>
              <label className={styles.field}>
                <span className="mono">Institution / company</span>
                <input name="org" autoComplete="organization" placeholder="Optional" />
              </label>
              <label className={`${styles.field} ${styles.wide}`}>
                <span className="mono">Reply to (email)</span>
                <input name="email" type="email" autoComplete="email" required />
              </label>
              <fieldset className={`${styles.field} ${styles.wide} ${styles.urgency}`}>
                <legend className="mono">Priority</legend>
                {['Routine', 'Priority', 'Just curious'].map((u) => (
                  <label key={u} className={styles.radio}>
                    <input type="radio" name="urgency" value={u} checked={urgency === u} onChange={() => setUrgency(u)} />
                    <span>{u}</span>
                  </label>
                ))}
              </fieldset>
              <label className={`${styles.field} ${styles.wide}`}>
                <span className="mono">Clinical question (what are you working on?)</span>
                <textarea name="question" rows={5} required />
              </label>
              <div className={`${styles.wide} ${styles.actions}`}>
                <Magnetic>
                  <button type="submit" className={styles.submit} disabled={status === 'sending'}>
                    {status === 'sending' ? 'Sending…' : 'Submit referral'} <span aria-hidden="true">→</span>
                  </button>
                </Magnetic>
                {status === 'error' && (
                  <p role="alert" className={styles.error}>
                    That didn’t go through. Email <a href={`mailto:${profile.email}`}>{profile.email}</a> directly.
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
