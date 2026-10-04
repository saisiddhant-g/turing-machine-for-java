import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // In dev, proxy /api/* to the local Flask backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  // VITE_API_URL is injected at build time via environment variable.
  // Set it in Vercel project settings → Environment Variables.
  // Example: VITE_API_URL=https://your-ntm-backend.example.com
  // When not set, the app uses relative /api (works in local dev via proxy above).
})
