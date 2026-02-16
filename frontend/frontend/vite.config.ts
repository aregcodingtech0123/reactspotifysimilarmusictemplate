import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Multi-service proxy configuration.
 * 
 * Service mapping:
 * - Core (4000): /api/auth/*, /api/users/*, /api/playlists/*
 * - Secondary (4001): /api/contact/*
 * - AI (8000): /api/songs/*, /api/trending, /api/recommend, /api/history
 * 
 * Note: Frontend should use direct calls via apiConfig.ts, but proxy serves as fallback.
 */
const CORE_BACKEND = 'http://localhost:4000';
const SECONDARY_BACKEND = 'http://localhost:4001';
const AI_BACKEND = 'http://localhost:8000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Core service (4000): Auth, Users, Playlists
      '/api/auth': {
        target: CORE_BACKEND,
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', () => {
            console.error('[vite proxy] Core backend (4000) unreachable — is Express backend running?');
          });
        },
      },
      '/api/users': {
        target: CORE_BACKEND,
        changeOrigin: true,
        secure: false,
      },
      '/api/playlists': {
        target: CORE_BACKEND,
        changeOrigin: true,
        secure: false,
      },
      // Secondary service (4001): Contact
      '/api/contact': {
        target: SECONDARY_BACKEND,
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', () => {
            console.error('[vite proxy] Secondary backend (4001) unreachable — is NestJS backend running?');
          });
        },
      },
      // AI service (8000): Songs, Recommendations, Trending, History
      '/api/songs': {
        target: AI_BACKEND,
        changeOrigin: true,
        secure: false,
      },
      '/api/trending': {
        target: AI_BACKEND,
        changeOrigin: true,
        secure: false,
      },
      '/api/recommend': {
        target: AI_BACKEND,
        changeOrigin: true,
        secure: false,
      },
      '/api/recommendations': {
        target: AI_BACKEND,
        changeOrigin: true,
        secure: false,
      },
      '/api/history': {
        target: AI_BACKEND,
        changeOrigin: true,
        secure: false,
      },
      // Fallback for other /api routes → AI service
      '/api': {
        target: AI_BACKEND,
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', () => {
            console.error('[vite proxy] AI backend (8000) unreachable — is FastAPI running? Start with: uvicorn main:app --reload --host 0.0.0.0');
          });
        },
      },
    },
  },
});
