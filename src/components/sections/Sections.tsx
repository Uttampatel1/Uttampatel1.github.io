import { useState } from 'react'
import { epochs } from '../../data/experience'
import { about, education, faq, links, profile, services } from '../../data/profile'
import { projects } from '../../data/projects'
import { skillClusters } from '../../data/skills'
import { CollaborateRequest } from '../signature/CollaborateRequest'
import { EmbeddingSpace } from '../signature/EmbeddingSpace'
import { TrainingLog } from '../signature/TrainingLog'
import { Layer } from '../ui/Layer'
import { Todo } from '../ui/Todo'
import styles from './Sections.module.css'

export function About() {
  const facts: [string, React.ReactNode][] = [
    ['role', profile.role],
    ['currently', 'IBM'],
    ['ships', 'ML models · LLM agents · SaaS · data systems'],
    ['founder', 'Hunexture (agency) · CliniqEase (SaaS)'],
    ['education', education.school ? `${education.degree}, ${education.school}` : education.degree],
    ['based', profile.location],
    [
      'contact',
      <a key="e" className="u-link" href={`mailto:${profile.email}`}>
        {profile.email}
      </a>,
    ],
  ]
  return (
    <Layer
      id="about"
      meta={`d_model=${services.length}`}
      aside="identity → vector"
      title={
        <>
          From idea <em>to production.</em>
        </>
      }
      lead={profile.intro}
    >
      <div className={styles.aboutGrid}>
        <div className={styles.aboutText} data-stagger>
          {about.map((p, i) => (
            <p key={i} className={i === 0 ? styles.big : styles.body}>
              {p}
            </p>
          ))}
        </div>
        <dl className={styles.facts} aria-label="Key facts">
          {facts.map(([k, v]) => (
            <div key={k} className={styles.fact}>
              <dt className="mono">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
          {!education.school && <Todo>college + years → data/profile.ts → education</Todo>}
        </dl>
      </div>

      <ol className={styles.services} data-stagger aria-label="What I build">
        {services.map((s, i) => (
          <li key={s.title} className={styles.service}>
            <span className={`mono ${styles.dim}`} aria-hidden="true">
              d_{String(i).padStart(2, '0')}
            </span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </Layer>
  )
}

export function Skills() {
  const n = skillClusters.reduce((s, c) => s + c.items.length, 0)
  return (
    <Layer
      id="skills"
      meta={`${n} points · ${skillClusters.length} clusters`}
      aside="hover a skill for its nearest neighbours"
      title={
        <>
          The toolkit, <em>embedded.</em>
        </>
      }
      lead="Skills as points in a drifting 3D space. Hover or focus a cluster to isolate it; hover or focus a skill to see its nearest neighbours."
    >
      <EmbeddingSpace />
    </Layer>
  )
}

export function Log() {
  return (
    <Layer
      id="log"
      meta={`${epochs.length} epochs`}
      aside="loss ↓ as you scroll"
      title={
        <>
          The training <em>log.</em>
        </>
      }
      lead="Experience as a training run: each role is an epoch, each milestone a checkpoint."
    >
      <TrainingLog />
    </Layer>
  )
}

export function Faq() {
  return (
    <Layer
      id="faq"
      meta={`held-out set · n=${faq.length}`}
      aside="or press Ctrl/⌘ K to ask your own"
      title={
        <>
          Held-out <em>questions.</em>
        </>
      }
    >
      <div className={styles.faq}>
        {faq.map((item, i) => (
          <details key={item.q} className={styles.qa}>
            <summary>
              <span className={`mono ${styles.qIdx}`}>q_{String(i).padStart(2, '0')}</span>
              <span className={styles.q}>{item.q}</span>
              <span className={styles.plus} aria-hidden="true" />
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </Layer>
  )
}

function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const range = document.createRange()
      range.selectNodeContents(document.getElementById('email-text')!)
      window.getSelection()?.removeAllRanges()
      window.getSelection()?.addRange(range)
    }
  }
  return (
    <div className={styles.email}>
      <a id="email-text" className="u-link" href={`mailto:${email}`}>
        {email}
      </a>
      <button type="button" className={`mono ${styles.copy}`} onClick={copy}>
        {copied ? 'Copied' : 'Copy'}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Email address copied' : ''}
      </span>
    </div>
  )
}

export function Contact() {
  const liveLinks = links.filter((l) => l.href)
  return (
    <Layer
      id="contact"
      meta="POST /collaborate"
      aside={`${projects.length} models on file · yours next`}
      title={
        <>
          Send a <em>request.</em>
        </>
      }
    >
      <div className={styles.contactGrid}>
        <div className={styles.contactInfo}>
          <p className={styles.big}>Building something with AI, data or a product that needs to ship? Send the request; a human answers.</p>
          <CopyEmail email={profile.email} />
          <address className={`mono ${styles.address}`}>{profile.address}</address>
          {liveLinks.length > 0 && (
            <ul className={styles.links}>
              {liveLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noreferrer" className="mono u-link">
                    {l.label} <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
          {links.some((l) => !l.href) && <Todo>GitHub / LinkedIn URLs → data/profile.ts → links</Todo>}
        </div>
        <CollaborateRequest />
      </div>
    </Layer>
  )
}
