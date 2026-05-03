import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/auth': { target: 'http://localhost:8000', changeOrigin: true },
      '/predict': { target: 'http://localhost:8000', changeOrigin: true },
      '/my-applications': { target: 'http://localhost:8000', changeOrigin: true },
      '/applications': { target: 'http://localhost:8000', changeOrigin: true },
    }
  }
})
