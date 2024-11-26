// vite.config.js
//added sitemap
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import sitemap from 'vite-plugin-sitemap';

export default defineConfig({
  plugins: [
    react(),
    // Integrate vite-plugin-sitemap
    sitemap({
      hostname: 'https://seatyourguests.com',
      dynamicRoutes: [
        '/',
        '/seating-planner',
        '/ai-seating',
        '/saved-layouts'
      ],
      exclude: ['/404'],
      outDir: './dist',
      filename: 'sitemap.xml'
    }),
    // Plugin to configure server and preview server middleware
    {
      name: 'configure-server',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url.endsWith('sitemap.xml')) {
            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url.endsWith('sitemap.xml')) {
            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          }
          next();
        });
      },
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    host: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Access-Control-Allow-Origin': '*'
    }
  },
  preview: {
    port: 3000,
    host: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Access-Control-Allow-Origin': '*'
    }
  }
});
