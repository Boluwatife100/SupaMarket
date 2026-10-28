import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, requests to /api are forwarded to the Express API on :3000.
// In Docker, nginx does the same job (see nginx.conf).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': { target: process.env.VITE_PROXY_TARGET || 'http://localhost:3000', changeOrigin: true } }
  }
});
