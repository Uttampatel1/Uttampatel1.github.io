import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'

// Splits text into word-ish tokens ("tokens" keep their trailing space, like a BPE stream).
export const tokenize = (s: string) => s.match(/\S+\s*/g) ?? []

type Props = {
  text: string
  run: boolean // start streaming when true
  msPerToken?: number
  className?: string
  caret?: boolean
  onDone?: () => void
}

// Streams text token by token once `run` flips true. The full text is always in the DOM for
// assistive tech (the visual copy is aria-hidden), and reduced motion shows it at once.
export function TokenStream({ text, run, msPerToken = 18, className, caret, onDone }: Props) {
  const tokens = tokenize(text)
  const [n, setN] = useState(0)
  const done = useRef(onDone)
  done.current = onDone

  useEffect(() => {
    if (!run) {
      setN(0)
      return
    }
    if (prefersReducedMotion()) {
      setN(tokens.length)
      done.current?.()
      return
    }
    let i = 0
    const id = window.setInterval(() => {
      i = Math.min(tokens.length, i + 1)
      setN(i)
      if (i >= tokens.length) {
        clearInterval(id)
        done.current?.()
      }
    }, msPerToken)
    return () => clearInterval(id)
  }, [run, text, msPerToken, tokens.length])

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {tokens.slice(0, n).join('')}
        {caret && run && n < tokens.length && <span className="stream-caret">▍</span>}
      </span>
    </span>
  )
}
