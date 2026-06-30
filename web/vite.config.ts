import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages project site: set VITE_BASE=/YourRepoName/ in CI
const base = process.env.VITE_BASE || '/';

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
});
