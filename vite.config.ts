import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

/**
 * Politique de sécurité du contenu, injectée dans le site publié uniquement (le serveur de
 * développement a besoin de scripts inline). Le site n'appelle aucun service : seuls ses propres
 * fichiers et la police Poppins (Google Fonts) sont autorisés. Les attributs style posés par React
 * passent par le CSSOM, non concerné par style-src ; 'unsafe-inline' n'y couvre que les styles
 * des graphiques (recharts).
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ')

function contentSecurityPolicy(): Plugin {
  return {
    name: 'content-security-policy',
    apply: 'build',
    transformIndexHtml: () => [
      {
        tag: 'meta',
        attrs: { 'http-equiv': 'Content-Security-Policy', content: CONTENT_SECURITY_POLICY },
        injectTo: 'head-prepend',
      },
      { tag: 'meta', attrs: { name: 'referrer', content: 'no-referrer' }, injectTo: 'head-prepend' },
    ],
  }
}

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
  plugins: [react(), tailwindcss(), contentSecurityPolicy()],
})
