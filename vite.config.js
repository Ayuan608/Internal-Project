import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/',
  plugins: [
    react({
      fastRefresh: true,
    }),
    tailwindcss()
  ],

  server: {
    port: 5173,
    strictPort: false,
    host: true,
    hmr: {
      overlay: false
    }
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
});