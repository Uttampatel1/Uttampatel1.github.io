import { useEffect, useRef, useState } from 'react'
import { profile } from '../../content'
import { slice } from '../../design/tokens'
import { WindowLevelDial } from '../signature/WindowLevelDial'
import styles from './Chrome.module.css'

const NAV = [
  ['#work', 'Work'],
  ['#services', 'Services'],
  ['#skills', 'Skills'],
  ['#report', 'Report'],
  ['#faq', 'FAQ'],
  ['#contact', 'Consult'],
] as const

export function Header() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className={styles.header}>
      <div className={`wrap ${styles.bar}`}>
        <a href="#top" className={styles.wordmark}>
          <span className={styles.mark} aria-hidden="true" />
          {profile.name}
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
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <WindowLevelDial />
      </div>
    </header>
  )
}

// Live slice readout tied to scroll depth: the page is the volume.
export function ScanHud() {
  const text = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      if (text.current) text.current.textContent = slice(1 + Math.round(p * 127))
      if (bar.current) bar.current.style.transform = `scaleX(${p})`
      // the hero has its own readout; the HUD takes over once it scrolls away
      root.current?.classList.toggle(styles.hudOn, window.scrollY > window.innerHeight * 0.6)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <div ref={root} className={`mono ${styles.hud}`} aria-hidden="true">
      <span ref={text}>{slice(1)}</span>
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
        <span className={styles.egg} title="Try it">
          ↑↑↓↓←→←→BA · or type “scan”
        </span>
        <span>End of study · {slice(128)}</span>
      </div>
    </footer>
  )
}
