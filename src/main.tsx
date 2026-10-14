import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { reloadLatestVersion } from './lib/staleVersion'

// Fichier introuvable au préchargement d'une page (site mis en ligne depuis l'ouverture de l'onglet) :
// on recharge la dernière version plutôt que de laisser la page échouer.
window.addEventListener('vite:preloadError', (event) => {
  if (reloadLatestVersion()) event.preventDefault()
})

// Après un tel rechargement, le paramètre anti-cache n'a plus d'utilité dans l'adresse.
const current = new URL(window.location.href)
if (current.searchParams.has('v')) {
  current.searchParams.delete('v')
  window.history.replaceState(null, '', current.toString())
}

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
