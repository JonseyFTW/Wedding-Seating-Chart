import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import sitemap from 'vite-plugin-sitemap';
import { copyFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
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
    {
      name: 'copy-robots',
      writeBundle() {
        copyFileSync('robots.txt', 'dist/robots.txt');
      },
    },
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