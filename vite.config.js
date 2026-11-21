import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Cadence',
        short_name: 'Cadence',
        description: 'A calm running log with an AI coach.',
        display: 'standalone',
        background_color: '#f3f3f3',
        theme_color: '#f3f3f3',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // never serve the app shell for API calls
        navigateFallbackDenylist: [/^\/api\//]
      }
    })
  ]
});
