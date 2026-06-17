import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const BASE = process.env.VITE_BASE_URL ?? '/'

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'كأس العالم 2026',
        short_name: 'كأس العالم',
        description: 'تطبيق متابعة بطولة كأس العالم 2026',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: BASE,
        start_url: BASE,
        lang: 'ar',
        dir: 'rtl',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}']
      },
      devOptions: { enabled: true, type: 'module' }
    })
  ]
})

