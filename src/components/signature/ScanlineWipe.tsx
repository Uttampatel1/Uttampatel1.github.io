import { useEffect, useRef } from 'react'
import { scrollToEl } from '../../lib/scroll'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import styles from './ScanOverlays.module.css'

// Section transitions: in-page links close a horizontal scanline over the view, jump,
// and reopen it (~600 ms total). Focus moves to the target so keyboard users land there too.
export function ScanlineWipe() {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let busy = false
    const onClick = async (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]')
      if (!a || a.hash.length < 2) return
      const target = document.getElementById(decodeURIComponent(a.hash.slice(1)))
      if (!target) return
      e.preventDefault()
      if (busy) return
      busy = true
      const land = () => {
        scrollToEl(target)
        history.pushState(null, '', a.hash)
        target.focus({ preventScroll: true })
      }
      const el = panel.current
      if (prefersReducedMotion() || !el) {
        land()
        busy = false
        return
      }
      const ease = 'cubic-bezier(0.65, 0, 0.35, 1)'
      await el.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }], { duration: 280, easing: ease, fill: 'forwards' }).finished
      land()
      await el.animate([{ clipPath: 'inset(0 0 0% 0)' }, { clipPath: 'inset(100% 0 0 0)' }], { duration: 340, easing: ease, fill: 'forwards' }).finished
      busy = false
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <div ref={panel} className={styles.wipe} aria-hidden="true">
      <span className={styles.wipeLine} />
    </div>
  )
}
