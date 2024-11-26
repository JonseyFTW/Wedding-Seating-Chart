// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import sitemap from 'vite-plugin-sitemap';
import { copyFileSync, writeFileSync, existsSync } from 'fs';

// Define the content of robots.txt
const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://seatyourguests.com/sitemap.xml`;

// Create robots.txt if it doesn't exist
const robotsPath = path.resolve(__dirname, 'robots.txt');
if (!existsSync(robotsPath)) {
  writeFileSync(robotsPath, robotsTxt);
}

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
    // Plugin to copy robots.txt to the dist folder after build
    {
      name: 'copy-robots',
      writeBundle() {
        copyFileSync(robotsPath, path.resolve(__dirname, 'dist/robots.txt'));
      },
    },
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
