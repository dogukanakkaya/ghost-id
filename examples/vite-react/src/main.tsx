import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { GhostID } from '../../../src/index.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Render <GhostID> conditionally if needed, for different environments */}
    <GhostID>
      <App />
    </GhostID>
  </StrictMode>,
)
