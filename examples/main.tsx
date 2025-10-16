import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { GhostExport } from '../src'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <GhostExport>
            <App />
        </GhostExport>
    </StrictMode>,
)
