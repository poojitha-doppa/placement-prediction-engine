import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
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
