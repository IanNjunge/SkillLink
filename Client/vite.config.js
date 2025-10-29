import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:5000',
      '/skills': 'http://localhost:5000',
      '/mentorship': 'http://localhost:5000',
      '/search': 'http://localhost:5000',
      '/upload': 'http://localhost:5000'
    }
  }
})
