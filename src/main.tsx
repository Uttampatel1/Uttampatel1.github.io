// base.css first: component CSS modules must come after it in the cascade so they can override it
import './styles/base.css'
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'
import { initTemperature } from './hooks/useTemperature'

initTemperature()

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// production builds ship prerendered HTML (scripts/prerender.mjs): hydrate it; dev renders fresh
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
