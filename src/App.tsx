import { useEffect } from 'react'
import { initScroll } from './lib/scroll'
import { Footer, Header, ScanHud } from './components/sections/Chrome'
import { About, Contact, Faq, Report, Services, Skills, Work } from './components/sections/Sections'
import { CrosshairCursor, FocusBrackets } from './components/signature/CrosshairCursor'
import { HeroField } from './components/signature/HeroField'
import { ScanEasterEgg } from './components/signature/ScanEasterEgg'
import { ScanlineWipe } from './components/signature/ScanlineWipe'
import { useReducedMotion } from './hooks/useReducedMotion'

export default function App() {
  const reduce = useReducedMotion()

  // Smooth scroll + scroll-linked reveals load after first paint; the page works without them.
  useEffect(() => {
    let dispose: (() => void) | undefined
    let cancelled = false
    const id = window.setTimeout(async () => {
      const d = await initScroll(reduce)
      if (cancelled) d()
      else dispose = d
    }, 50)
    return () => {
      cancelled = true
      clearTimeout(id)
      dispose?.()
    }
  }, [reduce])

  return (
    <>
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
        <HeroField />
        <About />
        <Work />
        <Services />
        <Skills />
        <Report />
        <Faq />
        <Contact />
      </main>
      <Footer />

      <ScanHud />
      <ScanlineWipe />
      <ScanEasterEgg />
      <FocusBrackets />
      <CrosshairCursor />
    </>
  )
}
