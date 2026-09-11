import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Chemins relatifs : le build fonctionne quel que soit le sous-dossier (ou la racine)
  // sous lequel il est servi, sans dépendre d'un préfixe d'hébergement particulier.
  base: './',
  plugins: [react(), tailwindcss()],
})
