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

// fine-pointer only, and never on the critical path
const AttentionCursor = lazy(() => import('./components/signature/AttentionCursor').then((m) => ({ default: m.AttentionCursor })))

export default function App() {
  const reduce = useReducedMotion()
  const [enhance, setEnhance] = useState(false)

  // Smooth scroll, reveals and the cursor load after first paint; the page works without them.
  useEffect(() => {
    let dispose: (() => void) | undefined
    let cancelled = false
    const id = window.setTimeout(async () => {
      setEnhance(true)
      const d = await initScroll(reduce)
      if (cancelled) d()
      else dispose = d
    }, 60)
    return () => {
      cancelled = true
      clearTimeout(id)
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
        <About />
        <Work />
        <Skills />
        <Log />
        <Faq />
        <Contact />
      </main>
      <Footer />

      <LayerHud />
      <CommandBarLauncher />
      <Overfit />
      {enhance && getDeviceTier().finePointer && (
        <Suspense fallback={null}>
          <AttentionCursor />
        </Suspense>
      )}
    </>
  )
}
