/**
 * API client: base URL and fetch with Authorization: Bearer <token>.
 * Uses core service (port 4000) for auth-related endpoints.
 */

import { API_CONFIG, getApiUrl } from '../config/apiConfig';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function setUser(user: { id: string; username: string; email: string } | null): void {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export function getUser(): { id: string; username: string; email: string } | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { id: string; username: string; email: string };
  } catch {
    return null;
  }
}

export function clearAuthStorage(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<{ data: T; ok: true } | { error: { message: string }; ok: false }> {
  const { skipAuth, ...fetchOptions } = options;
  // Route mapping:
  // - Auth/Users/Playlists → core service (4000)
  // - Contact → secondary service (4001)
  // - Songs/Recommendations/Trending/History → AI service (8000)
  let service: 'core' | 'secondary' | 'ai' = 'ai';
  if (path.startsWith('/api/auth') || path.startsWith('/api/users') || path.startsWith('/api/playlists')) {
    service = 'core';
  } else if (path.startsWith('/api/contact')) {
    service = 'secondary';
  }
  const url = path.startsWith('http') ? path : getApiUrl(path, service);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };
  const token = getToken();
  if (token && !skipAuth) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(url, { ...fetchOptions, headers });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = (json?.error?.message as string) || json?.message || `Request failed: ${res.status} ${res.statusText}`;
      return { ok: false, error: { message } };
    }

    const responseData = json.data ?? json;
    return { ok: true, data: responseData };
  } catch (error) {
    return { ok: false, error: { message: error instanceof Error ? error.message : 'Network error' } };
  }
}
