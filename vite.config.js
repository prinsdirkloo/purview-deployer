import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set base to './' so asset paths are relative.
// Works for both:
//   - GitHub Pages at https://username.github.io/repo-name/
//   - Root domains at https://username.github.io/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
