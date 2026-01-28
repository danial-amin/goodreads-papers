import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    // Allow all Railway domains - using pattern that matches *.up.railway.app
    // If this doesn't work, we'll need to use a custom server
    strictPort: false
  }
})
