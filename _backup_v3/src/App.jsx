import { useEffect, useRef, useState } from 'react'
import KMeansCanvas from './KMeansCanvas.jsx'
import ServiceCanvas from './ServiceCanvas.jsx'
import { profile, about, services, projectCategories, projects, skills, education, faq, links } from './content.js'

function ThemeToggle({ theme, onToggle }) {
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button type="button" className="theme-toggle" onClick={onToggle} aria-label={`Switch to ${next} mode`}>
      {theme === 'dark' ? (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="currentColor" />
        </svg>
      )}
      <span>{next === 'light' ? 'Light' : 'Dark'}</span>
    </button>
  )
}

// Letters settle in one by one, each easing from light and wide to heavy and condensed.
function StaggeredName({ text }) {
  return (
    <h1 className="hero-name" aria-label={text}>
      {text.split(' ').map((word, wi, words) => (
        <span key={wi} className="hero-word" aria-hidden="true">
          {[...word].map((ch, ci) => (
            <span key={ci} className="hero-letter" style={{ '--i': words.slice(0, wi).join('').length + ci }}>
              {ch}
            </span>
          ))}
        </span>
      ))}
    </h1>
  )
}

function Section({ id, title, wide, children }) {
  return (
    <section id={id} className={`section reveal${wide ? ' section--wide' : ''}`} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="section-title">
        {title}
      </h2>
      <div className="section-body">{children}</div>
    </section>
  )
}

// Shows the final value at rest; counts up from zero the first time it scrolls into view.
function CountUp({ value }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(value)

  useEffect(() => {
    const m = value.match(/^([^\d]*)([\d.]+)(.*)$/)
    if (!m || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const [, pre, num, post] = m
    const target = parseFloat(num)
    const decimals = (num.split('.')[1] || '').length
    let raf = 0
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const tick = (now) => {
          const p = Math.min(1, (now - start) / 1400)
          const eased = 1 - (1 - p) ** 4
          setShown(`${pre}${(target * eased).toFixed(decimals)}${post}`)
          if (p < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.6 },
    )
    io.observe(ref.current)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value])

  return (
    <span ref={ref} className="metric-value">
      {shown}
    </span>
  )
}

function Projects() {
  const [filter, setFilter] = useState('All')
  const [expanded, setExpanded] = useState(false)
  const matching = filter === 'All' ? projects : projects.filter((p) => p.category === filter)
  const visible = filter === 'All' && !expanded ? matching.slice(0, 6) : matching

  return (
    <>
      <div className="filters" role="group" aria-label="Filter projects">
        {['All', ...projectCategories].map((c) => (
          <button
            key={c}
            type="button"
            className="filter"
            aria-pressed={filter === c}
            onClick={() => {
              setFilter(c)
              setExpanded(false)
            }}
          >
            {c}
            <span className="filter-count">
              {c === 'All' ? projects.length : projects.filter((p) => p.category === c).length}
            </span>
          </button>
        ))}
      </div>

      <ul className="projects" key={filter}>
        {visible.map((p, i) => (
          <li key={p.title} className="project" style={{ '--d': `${i * 60}ms` }}>
            <div className="metric">
              {p.metric ? (
                <>
                  <CountUp value={p.metric.value} />
                  <span className="metric-label">{p.metric.label}</span>
                </>
              ) : (
                <span className="metric-label">{p.category}</span>
              )}
            </div>
            <div className="project-text">
              <h3>{p.title}</h3>
              <p>{p.summary}</p>
              <ul className="stack" aria-label="Tools used">
                {p.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>

      {filter === 'All' && (
        <button type="button" className="more" onClick={() => setExpanded((e) => !e)} aria-expanded={expanded}>
          {expanded ? 'Show fewer projects' : `Show all ${projects.length} projects`}
        </button>
      )}
    </>
  )
}

function CopyEmail({ email }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard refused: select the address so it can be copied by hand
      const range = document.createRange()
      range.selectNodeContents(document.getElementById('email-text'))
      window.getSelection().removeAllRanges()
      window.getSelection().addRange(range)
    }
  }
  return (
    <div className="email">
      <a id="email-text" href={`mailto:${email}`}>
        {email}
      </a>
      <button type="button" className="copy" onClick={copy}>
        {copied ? 'Copied' : 'Copy email'}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Email address copied' : ''}
      </span>
    </div>
  )
}

export default function App() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#16122B' : '#F4F3FA')
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* storage unavailable: theme just won't persist */
    }
  }, [theme])

  const liveLinks = links.filter((l) => l.href)

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="scroll-progress" aria-hidden="true" />
      <header className="topbar">
        <a href="#top" className="wordmark">
          Uttam Patel
        </a>
        <nav aria-label="Sections">
          <a href="#services">Services</a>
          <a href="#work">Portfolio</a>
          <a href="#skills">Skills</a>
          <a href="#faq">FAQ</a>
          <a href="#contact">Contact</a>
        </nav>
        <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />
      </header>

      <main id="main">
        <div id="top" className="hero">
          <KMeansCanvas theme={theme} />
          <div className="hero-text">
            <p className="hero-role">{profile.title}</p>
            <StaggeredName text={profile.name} />
            <p className="hero-intro">{profile.intro}</p>
          </div>
        </div>

        <Section id="about" title="About">
          {about.map((p) => (
            <p key={p.slice(0, 20)}>{p}</p>
          ))}
        </Section>

        <Section id="services" title="Services" wide>
          <div className="services">
            {services.map((svc) => (
              <article key={svc.title} className="service">
                <ServiceCanvas kind={svc.visual} theme={theme} />
                <h3>{svc.title}</h3>
                <p>{svc.text}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section id="work" title="Portfolio" wide>
          <Projects />
        </Section>

        <Section id="skills" title="Toolkit">
          <dl className="skills">
            {skills.map((g) => (
              <div key={g.group} className="skill-row">
                <dt>{g.group}</dt>
                <dd>{g.items.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section id="education" title="Education">
          {education.map((e) => (
            <div key={e.degree} className="edu">
              <h3>{e.degree}</h3>
              {(e.school || e.years) && <p>{[e.school, e.years].filter(Boolean).join(', ')}</p>}
            </div>
          ))}
        </Section>

        <Section id="faq" title="Questions">
          <div className="faq">
            {faq.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </Section>

        <Section id="contact" title="Contact">
          <p className="contact-lead">
            Working on something with data or AI? I’m glad to talk about projects, roles or a problem you’re stuck on.
          </p>
          <CopyEmail email={profile.email} />
          <address className="address">{profile.address}</address>
          {liveLinks.length > 0 && (
            <ul className="links">
              {liveLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noreferrer">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </main>

      <footer className="footer">
        <p>
          © {new Date().getFullYear()} {profile.name}.
        </p>
      </footer>
    </>
  )
}
