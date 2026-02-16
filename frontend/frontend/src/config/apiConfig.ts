/**
 * Centralized API configuration for multi-service architecture.
 * 
 * Service mapping:
 * - core (4000): Authentication, Users, Playlists
 * - secondary (4001): Alternative backend (same as core, NestJS version)
 * - ai (8000): Songs, Recommendations, History, Trending, AI embeddings
 */
export const API_CONFIG = {
  core: typeof import.meta !== 'undefined' && import.meta.env?.VITE_CORE_API_URL
    ? (import.meta.env.VITE_CORE_API_URL as string)
    : 'http://localhost:4000',
  secondary: typeof import.meta !== 'undefined' && import.meta.env?.VITE_SECONDARY_API_URL
    ? (import.meta.env.VITE_SECONDARY_API_URL as string)
    : 'http://localhost:4001',
  ai: typeof import.meta !== 'undefined' && import.meta.env?.VITE_AI_API_URL
    ? (import.meta.env.VITE_AI_API_URL as string)
    : 'http://localhost:8000/api',
} as const;

/**
 * Legacy: Default to AI service for backward compatibility.
 * @deprecated Use getApiUrl with explicit service instead.
 */
export const API_BASE_URL = API_CONFIG.ai;

/**
 * Get full API URL for a path.
 * @param path - API path (e.g., '/songs', '/auth/login')
 * @param service - Which backend service to use ('core', 'secondary', or 'ai')
 */
export function getApiUrl(path: string, service: 'core' | 'secondary' | 'ai' = 'ai'): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const baseUrl = API_CONFIG[service];
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
