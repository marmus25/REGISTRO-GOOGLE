import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/REGISTRO-GOOGLE/',
  optimizeDeps: {
    entries: ['src/**/*.{ts,tsx}'],
  },
})