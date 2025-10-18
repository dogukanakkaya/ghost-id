import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { GhostExport } from '../../../src/index.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Render <GhostExport> conditionally if needed, for different environments */}
    <GhostExport>
      <App />
    </GhostExport>
  </StrictMode>,
)
