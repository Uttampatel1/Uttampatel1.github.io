import { useEffect } from 'react'

// Pointer position as a mutable store: the cursor and hero read it inside rAF loops,
// so nothing re-renders on mousemove.
export const pointer = { x: -1, y: -1, active: false }

let bound = 0
const onMove = (e: PointerEvent) => {
  if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
  pointer.x = e.clientX
  pointer.y = e.clientY
  pointer.active = true
}
const onLeave = () => {
  pointer.active = false
}

export function useCursor() {
  useEffect(() => {
    if (bound++ === 0) {
      window.addEventListener('pointermove', onMove, { passive: true })
      document.documentElement.addEventListener('pointerleave', onLeave)
    }
    return () => {
      if (--bound === 0) {
        window.removeEventListener('pointermove', onMove)
        document.documentElement.removeEventListener('pointerleave', onLeave)
      }
    }
  }, [])
  return pointer
}
