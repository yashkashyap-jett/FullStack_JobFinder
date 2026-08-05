import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/candidate': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/recruiter': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/jobs': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/applications': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/bookmarks': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
