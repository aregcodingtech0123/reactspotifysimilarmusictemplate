/**
 * API client: base URL and fetch with Authorization: Bearer <token>.
 */

const API_BASE =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
    ? (import.meta.env.VITE_API_URL as string)
    : 'http://localhost:4000';

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
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };
  const token = getToken();
  if (token && !skipAuth) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...fetchOptions, headers });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = (json?.error?.message as string) || 'Request failed';
    return { ok: false, error: { message } };
  }
  return { ok: true, data: json.data ?? json };
}
