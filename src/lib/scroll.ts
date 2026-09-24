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
  }

  if (!reduce) {
    // Section entrance: a horizontal scanline sweeps down and the slice "develops" behind it.
    // Only sections still below the fold are prepared, so nothing already on screen ever hides.
    document.querySelectorAll<HTMLElement>('[data-slice]').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return
      const body = el.querySelector<HTMLElement>('[data-slice-body]')
      const line = el.querySelector<HTMLElement>('[data-scanline]')
      if (!body) return
      gsap.set(body, { clipPath: 'inset(0 0 100% 0)' })
      const tl = gsap.timeline({ paused: true })
      tl.to(body, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'expo.out' })
      if (line) tl.fromTo(line, { top: '0%', opacity: 1 }, { top: '100%', opacity: 0, duration: 0.9, ease: 'expo.out' }, 0)
      ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => tl.play() })
    })

    // Staggered measurement reveals for anything marked [data-stagger] > *
    document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((group) => {
      if (group.getBoundingClientRect().top < window.innerHeight * 0.9) return
      const items = Array.from(group.children)
      gsap.set(items, { y: 18, opacity: 0 })
      ScrollTrigger.create({
        trigger: group,
        start: 'top 85%',
        once: true,
        onEnter: () => gsap.to(items, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.06 }),
      })
    })
  }
  return () => {
    ScrollTrigger.getAll().forEach((t) => t.kill())
    lenis?.destroy()
    lenis = null
  }
}

export function scrollToEl(el: HTMLElement) {
  if (lenis) lenis.scrollTo(el, { immediate: true, force: true })
  else el.scrollIntoView({ behavior: 'auto', block: 'start' })
}

export const refreshScroll = async () => {
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  ScrollTrigger.refresh()
}
