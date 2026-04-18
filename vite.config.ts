import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',   // relative paths → works on GitHub Pages sub-paths AND custom domains
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
