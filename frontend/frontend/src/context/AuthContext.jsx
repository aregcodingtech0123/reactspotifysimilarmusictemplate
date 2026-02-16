import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

function restoreStoredUser() {
  try {
    const token = authService.getToken();
    const storedUser = authService.getUser();
    if (token && storedUser && storedUser.id) return storedUser;
  } catch (_) {}
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(restoreStoredUser);
  const [isLoading, setIsLoading] = useState(() => {
    const token = authService.getToken();
    const storedUser = authService.getUser();
    if (!token) return false;
    if (storedUser && storedUser.id) return false;
    return true;
  });

  const setUser = useCallback((u) => {
    setUserState(u);
    if (u) authService.setUser(u);
    else authService.setUser(null);
  }, []);

  const login = useCallback((authResponse) => {
    authService.persistAuth(authResponse);
    setUserState(authResponse.user);
  }, []);

  const logout = useCallback(() => {
    authService.clearAuthStorage();
    setUserState(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const token = authService.getToken();
    if (!token) {
      setUserState(null);
      setIsLoading(false);
      return () => { cancelled = true; };
    }
    authService.getMe().then((me) => {
      if (cancelled) return;
      setUserState(me || null);
      if (!me) authService.clearAuthStorage();
      else authService.setUser(me);
      setIsLoading(false);
    }).catch(() => {
      if (!cancelled) {
        setUserState(null);
        authService.clearAuthStorage();
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
