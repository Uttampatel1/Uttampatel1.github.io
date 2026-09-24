import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' keeps asset paths relative so the build works on any host or sub-path
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    target: 'es2020',
    // three.js lands in its own lazy chunk; don't warn about it
    chunkSizeWarningLimit: 1000,
  },
})
