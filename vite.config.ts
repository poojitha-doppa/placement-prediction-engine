import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('html2canvas')) {
            return 'pdf-canvas';
          }

          if (id.includes('jspdf')) {
            return 'pdf-lib';
          }

          if (id.includes('@tanstack/react-query') || id.includes('axios')) {
            return 'data-vendor';
          }
        },
      },
    },
  },
});
