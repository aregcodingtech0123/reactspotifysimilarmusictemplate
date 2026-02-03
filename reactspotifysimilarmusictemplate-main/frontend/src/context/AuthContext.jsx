import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    if (token) {
      authService.getMe().then((me) => {
        if (!cancelled) {
          setUserState(me || null);
          if (!me) authService.clearAuthStorage();
          else authService.setUser(me);
        }
        setIsLoading(false);
      }).catch(() => {
        if (!cancelled) {
          setUserState(null);
          authService.clearAuthStorage();
        }
        setIsLoading(false);
      });
    } else {
      setUserState(null);
      setIsLoading(false);
    }
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
