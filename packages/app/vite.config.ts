import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      '@pixel-office/client': path.resolve(__dirname, '../client/src'),
    },
  },
  server: {
    port: 5173,
  },
});