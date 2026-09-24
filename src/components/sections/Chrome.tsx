import { useEffect, useRef, useState } from 'react'
import { profile } from '../../data/profile'
import { layerLabel, layers, type LayerId } from '../../design/tokens'
import { AskButton } from '../signature/CommandBarLauncher'
import { TemperatureDial } from '../signature/TemperatureDial'
import { Todo } from '../ui/Todo'
import styles from './Chrome.module.css'

const NAV = [
  ['#about', 'About'],
  ['#work', 'Work'],
  ['#skills', 'Skills'],
  ['#log', 'Log'],
  ['#contact', 'Contact'],
] as const

// Sticky mini-nav: the recruiter fast path. Name, sections, Ask, CV and the temperature dial.
export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`wrap ${styles.bar}`}>
        <a href="#top" className={styles.wordmark} aria-label={`${profile.name}, back to top`}>
          <svg viewBox="0 0 20 20" className={styles.mark} aria-hidden="true">
            <circle cx="3" cy="5" r="2" />
            <circle cx="3" cy="15" r="2" />
            <circle cx="17" cy="10" r="2.6" className={styles.markOut} />
            <path d="M3 5L17 10M3 15L17 10" />
          </svg>
          <span>{profile.name}</span>
          <span className={`mono ${styles.roleTag}`}>{profile.role}</span>
        </a>

        <nav aria-label="Sections" className={styles.navWrap}>
          <button
            type="button"
            className={`mono ${styles.menuBtn}`}
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? 'Close' : 'Index'}
          </button>
          <ul id="site-nav" className={`${styles.nav} ${open ? styles.open : ''}`}>
            {NAV.map(([href, label], i) => (
              <li key={href}>
                <a href={href} className="mono u-link" onClick={() => setOpen(false)}>
                  <span className={styles.navIdx} aria-hidden="true">
                    {String(i + 2).padStart(2, '0')}
                  </span>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.tools}>
          <AskButton className={styles.askBtn} />
          {profile.cvHref ? (
            <a className={`mono ${styles.cv}`} href={profile.cvHref} download>
              CV <span aria-hidden="true">↓</span>
            </a>
          ) : (
            <Todo>CV</Todo>
          )}
          <TemperatureDial />
        </div>
      </div>
    </header>
  )
}

// Fixed readout of which layer of the forward pass is on screen, plus overall progress.
export function LayerHud() {
  const [current, setCurrent] = useState<LayerId>('top')
  const bar = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const els = layers.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(e.target.id as LayerId)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))

    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      if (bar.current) bar.current.style.transform = `scaleX(${p})`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className={`mono ${styles.hud} ${current === 'top' ? styles.hudHidden : ''}`} aria-hidden="true">
      <span>{layerLabel(current)}</span>
      <span className={styles.hudTrack}>
        <span ref={bar} className={styles.hudBar} />
      </span>
    </div>
  )
}

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap mono ${styles.footBar}`}>
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span className={styles.egg}>↑↑↓↓←→←→BA · or type “overfit”</span>
        <span>end of forward pass · {layers.length} layers</span>
      </div>
    </footer>
  )
}
