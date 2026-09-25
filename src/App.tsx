import { lazy, Suspense, useEffect, useState } from 'react'
import { Footer, Header, LayerHud } from './components/sections/Chrome'
import { About, Contact, Faq, Log, Skills } from './components/sections/Sections'
import { Work } from './components/sections/Work'
import { CommandBarLauncher } from './components/signature/CommandBarLauncher'
import { HeroNetwork } from './components/signature/HeroNetwork'
import { Overfit } from './components/signature/Overfit'
import { getDeviceTier } from './hooks/useDeviceTier'
import { useReducedMotion } from './hooks/useReducedMotion'
import { initScroll } from './lib/scroll'

// fine-pointer only, off under reduced motion (native cursor instead), never on the critical path
const AttentionCursor = lazy(() => import('./components/signature/AttentionCursor').then((m) => ({ default: m.AttentionCursor })))

export default function App() {
  const reduce = useReducedMotion()
  const [enhance, setEnhance] = useState(false)

  // Smooth scroll, reveals and the cursor load after first paint; the page works without them.
  useEffect(() => {
    let dispose: (() => void) | undefined
    let cancelled = false
    // wait for the page to finish loading, then for an idle moment: none of this is critical
    let idleId = 0
    const start = () => {
      const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200))
      idleId = idle(
        async () => {
          if (cancelled) return
          setEnhance(true)
          const d = await initScroll(reduce)
          if (cancelled) d()
          else dispose = d
        },
        { timeout: 1500 },
      ) as number
    }
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })
    return () => {
      cancelled = true
      window.removeEventListener('load', start)
      window.cancelIdleCallback?.(idleId)
      dispose?.()
    }
  }, [reduce])

  return (
    <>
      <a className="skip-link" href="#work">
        Skip to work
      </a>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="gridlines wrap grid12" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} />
        ))}
      </div>
      <div className="grain" aria-hidden="true" />

      <Header />
      <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
        <HeroNetwork />
        {/* one Suspense boundary per layer: React hydrates each as its own chunk and yields in
            between, instead of one long blocking task for the whole prerendered page */}
        {[About, Work, Skills, Log, Faq, Contact].map((Section, i) => (
          <Suspense key={i} fallback={null}>
            <Section />
          </Suspense>
        ))}
      </main>
      <Footer />

      <LayerHud />
      <CommandBarLauncher />
      <Overfit />
      {enhance && !reduce && getDeviceTier().finePointer && (
        <Suspense fallback={null}>
          <AttentionCursor />
        </Suspense>
      )}
    </>
  )
}
