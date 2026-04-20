import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy all /api/* requests to the FastAPI backend to avoid CORS
      // during dev. salesApi.js uses relative paths so this just works.
      // Override in local dev by setting CPG_API_TARGET env var.
      '/api': {
        target: process.env.CPG_API_TARGET || 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
});
