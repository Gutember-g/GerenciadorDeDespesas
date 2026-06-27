import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthSettingsProvider } from './contexts/AuthSettingsContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthSettingsProvider>
      <App />
    </AuthSettingsProvider>
  </StrictMode>,
)
