import { useCallback, useRef, useState } from 'react'
import { useEasterEgg } from '../../hooks/useEasterEgg'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'
import styles from './Overfit.module.css'

const SOUP = ['▁the', '##ing', '<unk>', '▁of', '</s>', '0.42', '▁∇', 'Σ', '▁attn', '##ed', '<pad>', '▁λ', 'NaN', '▁tok', '##ly', '▁[', ']', '▁=', '▁model', '##er']
const DURATION = 2000
const CONVERGE = 0.62 // fraction of the run spent melting down before re-converging

// Signature 8: the Konami code, or typing "overfit", glitches every visible line of text into token
// soup for two seconds, then re-converges cleanly: "model converged." Reduced motion: toast only.
export function Overfit() {
  const [toast, setToast] = useState(false)
  const running = useRef(false)

  const trigger = useCallback(() => {
    if (running.current) return
    running.current = true
    const finish = () => {
      running.current = false
      setToast(true)
      window.setTimeout(() => setToast(false), 2400)
    }
    if (prefersReducedMotion()) return finish()

    // collect the text nodes that are actually on screen
    const nodes: { node: Text; orig: string; soup: string[] }[] = []
    const walker = document.createTreeWalker(document.getElementById('main') ?? document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        const p = n.parentElement
        if (!p || !n.nodeValue?.trim() || p.closest('script, style, svg, canvas, .sr-only, input, textarea')) return NodeFilter.FILTER_REJECT
        const r = p.getBoundingClientRect()
        return r.bottom > 0 && r.top < window.innerHeight ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
      },
    })
    while (walker.nextNode() && nodes.length < 500) {
      const node = walker.currentNode as Text
      const orig = node.nodeValue!
      nodes.push({ node, orig, soup: orig.split(/(\s+)/) })
    }

    const root = document.documentElement
    root.classList.add(styles.glitch)
    const t0 = performance.now()
    const id = window.setInterval(() => {
      const p = Math.min(1, (performance.now() - t0) / DURATION)
      // 0 → 1 while melting down, then 1 → 0 while re-converging
      const heat = p < CONVERGE ? p / CONVERGE : 1 - (p - CONVERGE) / (1 - CONVERGE)
      for (const n of nodes) {
        if (!n.node.isConnected) continue
        let i = 0
        n.node.nodeValue = n.soup
          .map((w) => {
            if (/^\s+$/.test(w)) return w
            i++
            // re-converge left to right: early words settle first
            const settle = p > CONVERGE && i / (n.soup.length / 2 + 1) < (p - CONVERGE) / (1 - CONVERGE) * 1.4
            return !settle && Math.random() < heat * 0.9 ? SOUP[(Math.random() * SOUP.length) | 0] : w
          })
          .join('')
      }
      if (p >= 1) {
        clearInterval(id)
        for (const n of nodes) if (n.node.isConnected) n.node.nodeValue = n.orig
        root.classList.remove(styles.glitch)
        finish()
      }
    }, 60)
  }, [])

  useEasterEgg(trigger)

  return (
    <div className={`mono ${styles.toast} ${toast ? styles.show : ''}`} role="status" aria-live="polite">
      {toast && (
        <>
          <span className={styles.ok}>✓</span> model converged.
        </>
      )}
    </div>
  )
}
