import { useEffect } from 'react'

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
const WORD = 'overfit'

// Fires `onTrigger` on the Konami code or on typing "overfit" anywhere outside a form field.
export function useEasterEgg(onTrigger: () => void) {
  useEffect(() => {
    let k = 0
    let typed = ''
    const onKey = (e: KeyboardEvent) => {
      const t = e.target
      if (t instanceof Element && t.closest('input, textarea, select, [contenteditable="true"]')) return
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      k = key === KONAMI[k] ? k + 1 : key === KONAMI[0] ? 1 : 0
      typed = (typed + (key.length === 1 ? key : ' ')).slice(-WORD.length)
      if (k === KONAMI.length || typed === WORD) {
        k = 0
        typed = ''
        onTrigger()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onTrigger])
}
