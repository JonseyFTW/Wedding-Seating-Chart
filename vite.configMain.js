// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import sitemap from 'vite-plugin-sitemap';

export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: 'https://seatyourguests.com',
      dynamicRoutes: [
        '/', // Add more dynamic routes if necessary
        '/seating-planner',
        '/ai-seating',
        '/saved-layouts',
      ],
      exclude: ['/404'], // Exclude error pages or specific paths
      outDir: './dist',
      filename: 'sitemap.xml', // Output sitemap file name
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Shortcut for importing from `src`
    },
  },
  server: {
    port: 5173,
    host: true,
    headers: {
      'Access-Control-Allow-Origin': '*', // Allow API calls from all origins
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    },
  },
  preview: {
    port: 3000,
    host: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
});
