import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['fonts/cairo-arabic.woff2', 'fonts/cairo-latin.woff2', 'icons/icon.svg'],
      manifest: {
        name: 'ميثاق',
        short_name: 'ميثاق',
        description: 'تطبيقنا الخاص',
        dir: 'rtl',
        lang: 'ar',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0d0a1c',
        background_color: '#0d0a1c',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
