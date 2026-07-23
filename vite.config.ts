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
      includeAssets: [
        'fonts/tajawal-400.woff2', 'fonts/tajawal-500.woff2', 'fonts/tajawal-700.woff2',
        'fonts/tajawal-800.woff2', 'fonts/elmessiri-var.woff2',
        'icons/icon.svg', 'icons/apple-touch-icon.png', 'brand/*.webp',
      ],
      manifest: {
        name: 'ميثاق',
        short_name: 'ميثاق',
        description: 'مساحة دافئة لشخصين',
        dir: 'rtl',
        lang: 'ar',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#f6efe7',
        background_color: '#f6efe7',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
