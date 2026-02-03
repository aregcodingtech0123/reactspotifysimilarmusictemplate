/**
 * Auth API: login, register, getMe, googleAuth.
 */
import {
  apiRequest,
  setToken,
  setUser,
  clearAuthStorage,
  getToken,
  getUser,
} from './api';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  expiresIn: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const result = await apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

export async function register(
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const result = await apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
    skipAuth: true,
  });
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

export async function getMe(): Promise<AuthUser | null> {
  const result = await apiRequest<AuthUser>('/api/auth/me');
  if (!result.ok) return null;
  return result.data;
}

export async function googleAuth(idToken: string): Promise<AuthResponse> {
  const result = await apiRequest<AuthResponse>('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
    skipAuth: true,
  });
  if (!result.ok) throw new Error(result.error.message);
  return result.data;
}

export function persistAuth(response: AuthResponse): void {
  setToken(response.accessToken);
  setUser(response.user);
}

export { clearAuthStorage, getToken, getUser, setToken, setUser };
