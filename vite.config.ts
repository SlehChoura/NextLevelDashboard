import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages sert le projet sous /NextLevelDashboard/ : les assets doivent
  // être référencés avec ce préfixe en build, mais pas en dev local.
  base: command === 'build' ? '/NextLevelDashboard/' : '/',
  plugins: [react(), tailwindcss()],
}))
