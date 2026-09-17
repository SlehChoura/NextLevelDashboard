import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Chemins relatifs : le build fonctionne quel que soit le sous-dossier (ou la racine)
  // sous lequel il est servi, sans dépendre d'un préfixe d'hébergement particulier.
  base: './',
  // Assets statiques bruts (favicon...), copiés tels quels dans le build — renommé pour ne
  // pas entrer en conflit avec build.outDir ci-dessous, qui porte le même nom conventionnel.
  publicDir: 'static',
  build: {
    // Le build est versionné directement dans public/ sur `main`, pour un hébergement qui lit
    // ce dossier tel quel depuis le dépôt Git, sans étape de build de son côté.
    outDir: 'public',
  },
  plugins: [react(), tailwindcss()],
})
