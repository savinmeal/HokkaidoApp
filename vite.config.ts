import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import skiLiftStatusPlugin from './tools/skiLiftStatusPlugin.ts'
import oceanSightingsPlugin from './tools/oceanSightingsPlugin.ts'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    skiLiftStatusPlugin(),
    oceanSightingsPlugin(),
  ],

  

  preview: {
    host: '0.0.0.0',
    port: 4173,

    allowedHosts: [
      '.lhr.life',
    ],
  },
})