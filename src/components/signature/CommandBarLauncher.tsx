import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import styles from './CommandBar.module.css'

const CommandBar = lazy(() => import('./CommandBar'))

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

// Opens "Ask my portfolio": Cmd/Ctrl+K anywhere, the header button, or the floating button on
// touch devices. The dialog itself is a separate chunk, fetched on first open (or on hover intent).
export function CommandBarLauncher() {
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const prefetch = useCallback(() => void import('./CommandBar'), [])

  const show = useCallback(() => {
    setLoaded(true)
    setOpen(true)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setLoaded(true)
        setOpen((o) => !o)
      }
    }
    const onOpen = () => show()
    window.addEventListener('keydown', onKey)
    window.addEventListener('open-ask', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('open-ask', onOpen)
    }
  }, [show])

  return (
    <>
      <button type="button" className={`mono ${styles.fab}`} onClick={show} onPointerEnter={prefetch} aria-label="Ask my portfolio">
        <span aria-hidden="true">&gt;_</span> Ask
      </button>
      {loaded && (
        <Suspense fallback={null}>
          <CommandBar open={open} onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  )
}

// The header's version of the trigger, with the shortcut hint.
export function AskButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={`mono ${styles.ask} ${className ?? ''}`}
      onClick={() => window.dispatchEvent(new Event('open-ask'))}
      onPointerEnter={() => void import('./CommandBar')}
      aria-keyshortcuts={isMac ? 'Meta+K' : 'Control+K'}
    >
      Ask my portfolio <kbd aria-hidden="true">{isMac ? '⌘' : 'Ctrl'} K</kbd>
    </button>
  )
}
