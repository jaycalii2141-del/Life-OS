import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the production build can be opened/deployed from any path
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
    setupFiles: ['./src/test/setup.js'],
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Split big, stable dependencies into their own cached chunks.
        manualChunks: {
          react: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
});
