import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the production build can be opened/deployed from any path
export default defineConfig({
  base: './',
  plugins: [react()],
});
