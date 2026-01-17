import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  cacheDir: process.env.TEMP ? `${process.env.TEMP}/cut-list-vite-cache` : undefined
})
