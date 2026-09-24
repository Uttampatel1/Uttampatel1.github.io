import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { initWindowLevel } from './hooks/useWindowLevel'
import './styles/base.css'

initWindowLevel()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
