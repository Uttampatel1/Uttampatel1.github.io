// Smooth scroll + scroll-linked reveals. Loaded after first paint (dynamic import in App),
// so GSAP and Lenis never sit in the critical path. Content is fully visible without them.
import type Lenis from 'lenis'

let lenis: Lenis | null = null

export async function initScroll(reduce: boolean) {
  const [{ gsap }, { ScrollTrigger }, LenisMod] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
    reduce ? Promise.resolve(null) : import('lenis'),
  ])
  gsap.registerPlugin(ScrollTrigger)

  if (LenisMod) {
    lenis = new LenisMod.default({ lerp: 0.12, wheelMultiplier: 0.9 })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((t) => lenis?.raf(t * 1000))
    gsap.ticker.lagSmoothing(0)
    // in-page anchors go through Lenis so they glide instead of jumping
    document.addEventListener('click', onAnchor)
  }

  if (!reduce) {
    // Staggered reveals for anything marked [data-stagger] > *, only below the fold, so nothing
    // already on screen ever hides.
    document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((group) => {
      if (group.getBoundingClientRect().top < window.innerHeight * 0.9) return
      const items = Array.from(group.children)
      gsap.set(items, { y: 18, opacity: 0 })
      ScrollTrigger.create({
        trigger: group,
        start: 'top 88%',
        once: true,
        onEnter: () => gsap.to(items, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', stagger: 0.04 }),
      })
    })
  }
  return () => {
    document.removeEventListener('click', onAnchor)
    ScrollTrigger.getAll().forEach((t) => t.kill())
    lenis?.destroy()
    lenis = null
  }
}

function onAnchor(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]')
  if (!a || a.classList.contains('skip-link')) return
  const el = document.querySelector<HTMLElement>(a.getAttribute('href')!)
  if (!el) return
  e.preventDefault()
  scrollToEl(el)
  history.replaceState(null, '', a.getAttribute('href'))
  el.focus({ preventScroll: true })
}

export function scrollToEl(el: HTMLElement) {
  if (lenis) lenis.scrollTo(el, { offset: -60, duration: 1.1 })
  else el.scrollIntoView({ behavior: 'auto', block: 'start' })
}

export const refreshScroll = async () => {
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  requestAnimationFrame(() => ScrollTrigger.refresh())
}
