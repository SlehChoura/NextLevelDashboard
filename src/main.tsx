import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// L'ancienne page « Nouveau rapport » enregistrait une clé API Anthropic dans ce navigateur : la
// fonctionnalité ayant été retirée, la clé n'a plus de raison d'y rester.
try {
  localStorage.removeItem('nld-ai-settings')
} catch {
  // Stockage indisponible (navigation privée…) : rien à nettoyer.
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
