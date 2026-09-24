import { useState } from 'react'
import { about, faq, links, profile, projectCategories, projects, services } from '../../content'
import { useWindowLevel } from '../../hooks/useWindowLevel'
import { refreshScroll } from '../../lib/scroll'
import { ConsultForm } from '../signature/ConsultForm'
import { ProjectCard } from '../signature/ProjectCard'
import { ScanReport } from '../signature/ScanReport'
import { SkillCloud } from '../signature/SkillCloud'
import { Slice } from '../ui/Slice'
import { Todo } from '../ui/Todo'
import ServiceCanvas from './ServiceCanvas.jsx'
import styles from './Sections.module.css'

// Canvas illustrations read their colors once; re-key them when the W/L dial moves far enough.
function useCanvasThemeKey() {
  const wl = useWindowLevel()
  return `${wl.film}-${Math.round(wl.level / 10)}-${Math.round(wl.window / 20)}`
}

export function About() {
  return (
    <Slice
      id="about"
      index={1}
      sliceNo={16}
      kicker="About"
      title={
        <>
          Models that hold up <em>outside the notebook.</em>
        </>
      }
    >
      <div className={styles.aboutGrid} data-stagger>
        {about.map((p, i) => (
          <p key={i} className={i === 0 ? styles.lead : styles.aboutBody}>
            {p}
          </p>
        ))}
      </div>
    </Slice>
  )
}

export function Work() {
  const themeKey = useCanvasThemeKey()
  const [filter, setFilter] = useState('All')
  const [expanded, setExpanded] = useState(false)
  const matching = filter === 'All' ? projects : projects.filter((p) => p.category === filter)
  const visible = filter === 'All' && !expanded ? matching.slice(0, 6) : matching

  return (
    <Slice
      id="work"
      index={2}
      sliceNo={47}
      kicker="Selected work"
      aside={`${projects.length} projects`}
      title={
        <>
          Selected <em>work.</em>
        </>
      }
    >
      <div className={styles.filters} role="group" aria-label="Filter projects">
        {['All', ...projectCategories].map((c) => (
          <button
            key={c}
            type="button"
            className={`mono ${styles.filter}`}
            aria-pressed={filter === c}
            onClick={() => {
              setFilter(c)
              setExpanded(false)
              refreshScroll()
            }}
          >
            {c}
            <span className={styles.count}>{c === 'All' ? projects.length : projects.filter((p) => p.category === c).length}</span>
          </button>
        ))}
      </div>

      <ul className={styles.projects} key={filter}>
        {visible.map((p) => (
          <ProjectCard key={p.title} project={p} index={projects.indexOf(p)} themeKey={themeKey} />
        ))}
      </ul>

      {filter === 'All' && (
        <button
          type="button"
          className={`mono ${styles.more}`}
          onClick={() => {
            setExpanded((e) => !e)
            refreshScroll()
          }}
          aria-expanded={expanded}
        >
          {expanded ? 'Show fewer projects' : `Show all ${projects.length} projects`} <span aria-hidden="true">{expanded ? '−' : '+'}</span>
        </button>
      )}
    </Slice>
  )
}

export function Services() {
  const key = useCanvasThemeKey()
  return (
    <Slice
      id="services"
      index={3}
      sliceNo={63}
      kicker="Services"
      title={
        <>
          What I <em>build.</em>
        </>
      }
    >
      <div className={styles.services} data-stagger>
        {services.map((svc, i) => (
          <article key={svc.title} className={styles.service}>
            <div className={styles.serviceViz}>
              <ServiceCanvas kind={svc.visual} theme={key} />
              <span className={`mono ${styles.serviceIdx}`} aria-hidden="true">
                S-{String(i + 1).padStart(2, '0')}
              </span>
            </div>
            <h3>{svc.title}</h3>
            <p>{svc.text}</p>
          </article>
        ))}
      </div>
    </Slice>
  )
}

export function Skills() {
  return (
    <Slice
      id="skills"
      index={4}
      sliceNo={79}
      kicker="Toolkit"
      title={
        <>
          The toolkit, <em>as a volume.</em>
        </>
      }
    >
      <SkillCloud />
    </Slice>
  )
}

export function Report() {
  return (
    <Slice
      id="report"
      index={5}
      sliceNo={94}
      kicker="Experience"
      title={
        <>
          Scan <em>report.</em>
        </>
      }
    >
      <ScanReport />
    </Slice>
  )
}

export function Faq() {
  return (
    <Slice
      id="faq"
      index={6}
      sliceNo={110}
      kicker="Questions"
      title={
        <>
          Questions, <em>answered.</em>
        </>
      }
    >
      <div className={styles.faq}>
        {faq.map((item, i) => (
          <details key={item.q} className={styles.qa}>
            <summary>
              <span className={`mono ${styles.qIdx}`}>Q.{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.q}>{item.q}</span>
              <span className={styles.plus} aria-hidden="true" />
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </Slice>
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
    <Slice
      id="contact"
      index={7}
      sliceNo={125}
      kicker="Contact"
      title={
        <>
          Request a <em>consult.</em>
        </>
      }
    >
      <div className={styles.contactGrid}>
        <div className={styles.contactInfo}>
          <p className={styles.lead}>
            Working on something with data or AI? I’m glad to talk about projects, roles or a problem you’re stuck on.
          </p>
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
          {links.some((l) => !l.href) && <Todo>GitHub / LinkedIn URLs in content.ts → links</Todo>}
        </div>
        <ConsultForm />
      </div>
    </Slice>
  )
}
