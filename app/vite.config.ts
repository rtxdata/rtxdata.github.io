import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Privacy-first CSP: no external runtime origins. Everything is bundled and
// served same-origin (patterns.json via connect-src 'self'); style-src allows
// inline styles because Recharts/@base-ui set them at runtime.
const CSP =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; " +
  "base-uri 'self'; frame-ancestors 'none'"

// Inject the CSP meta only into the production build, so the dev server's HMR
// (which relies on inline scripts / eval) is not blocked.
const cspPlugin = {
  name: 'inject-csp',
  apply: 'build' as const,
  transformIndexHtml() {
    return [
      {
        tag: 'meta',
        attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
        injectTo: 'head-prepend' as const,
      },
    ]
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cspPlugin],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
