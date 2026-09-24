// base.css first: component CSS modules must come after it in the cascade so they can override it
import './styles/base.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { initTemperature } from './hooks/useTemperature'

initTemperature()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
