import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Needed so assets resolve correctly when served from GitHub Pages.
  base: '/gamesCompletitionTracker/',
  server: {
    open: true
  }
});
