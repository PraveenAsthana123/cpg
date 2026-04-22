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
  build: {
    // Split heavy deps into separate chunks so initial page-load stays small.
    // Previously the whole app shipped as one 1.9MB chunk (Reviewer §"Performance").
    rollupOptions: {
      output: {
        manualChunks: {
          // Charts — heavy, used only in a few tabs (Forecast / Simulation / KPI).
          recharts: ['recharts'],
          // Routing — used everywhere but small surface.
          router: ['react-router-dom'],
          // React core — stable, cache-friendly.
          react: ['react', 'react-dom'],
        },
      },
    },
    // With splitting, individual chunks fit more cleanly. The main index is
    // still ~1.2 MB pre-gzip (~300 KB gzip) because 14 depts × 17 tabs share
    // the initial bundle. Further optimization would use React.lazy on the
    // per-dept tab routes — deferred to Phase 3b. For now: 1500 suppresses
    // the noise without hiding a real regression.
    chunkSizeWarningLimit: 1500,
  },
});
