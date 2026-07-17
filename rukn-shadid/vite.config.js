import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/rukn-shadid/',
  server: {
    port: 3000,
    host: true,
  },
})
