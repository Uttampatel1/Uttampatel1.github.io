import { useEffect, useState, type RefObject } from 'react'

// `once`: latch true the first time the element enters; otherwise track visibility live.
export function useInView(ref: RefObject<Element | null>, { rootMargin = '0px', threshold = 0, once = false } = {}) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting)
        if (e.isIntersecting && once) io.disconnect()
      },
      { rootMargin, threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin, threshold, once])
  return inView
}
