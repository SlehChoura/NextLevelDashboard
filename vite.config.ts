import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base: works both at the project root and under a GitHub Pages
  // subpath (https://<user>.github.io/<repo>/) without hardcoding the repo name.
  base: "./",
  plugins: [react(), tailwindcss()],
})
