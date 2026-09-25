// Build-time prerender entry (see scripts/prerender.mjs). Renders the app to static HTML so the
// name, tagline and every section paint before any JavaScript runs; main.tsx then hydrates it.
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
