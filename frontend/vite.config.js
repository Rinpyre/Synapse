import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve('src'),
      '@renderer': resolve('src'),
      '@components': resolve('src/components'),
      '@routes': resolve('src/routes'),
      '@assets': resolve('src/assets'),
      '@utils': resolve('utils')
    }
  },
  plugins: [react(), tailwindcss()]
})
