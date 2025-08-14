import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', { target: '19' }]],
      },
    }),
  ],
  build: {
    outDir: '../ecommerce-backend/dist',
  },
  server: {
    proxy: {
      // forward all /api requests to backend
      '/api': 'http://localhost:3000',
    },
  },
});
