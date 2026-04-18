import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/petroamid-web/',   // must match the GitHub repo name exactly
  build: { outDir: 'dist', sourcemap: false },
})
