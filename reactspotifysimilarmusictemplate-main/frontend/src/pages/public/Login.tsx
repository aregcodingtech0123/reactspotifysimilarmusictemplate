import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as authService from '../../services/authService';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (res: { credential: string }) => void }) => void;
          renderButton: (el: HTMLElement, options: { type?: string; size?: string; text?: string }) => void;
        };
      };
    };
  }
}

/**
 * Login page (public). Email/password + Google OAuth.
 */
export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const onSuccessRef = useRef<(data: authService.AuthResponse) => void>(() => {});
  onSuccessRef.current = (data) => {
    authLogin(data);
    navigate('/', { replace: true });
  };
  const setErrorRef = useRef(setError);
  setErrorRef.current = setError;

  const [googleReady, setGoogleReady] = useState(false);
  useEffect(() => {
    if (window.google?.accounts?.id) {
      setGoogleReady(true);
      return;
    }
    const t = setInterval(() => {
      if (window.google?.accounts?.id) {
        setGoogleReady(true);
        clearInterval(t);
      }
    }, 150);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const clientId = typeof import.meta !== 'undefined' && (import.meta.env?.VITE_GOOGLE_CLIENT_ID as string);
    if (!clientId || !googleReady || !googleButtonRef.current || !window.google?.accounts?.id) return;
    const el = googleButtonRef.current;
    el.innerHTML = '';
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential: string }) => {
        setError('');
        setLoading(true);
        authService
          .googleAuth(response.credential)
          .then((data) => onSuccessRef.current(data))
          .catch((err) => {
            setErrorRef.current(err?.message || 'Google sign-in failed');
          })
          .finally(() => setLoading(false));
      },
    });
    window.google.accounts.id.renderButton(el, { type: 'standard', size: 'large', text: 'continue_with' });
  }, [googleReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill the empty inputs');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      authLogin(data);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-cyan-500 p-6">
          <h2 className="text-center text-white text-3xl font-bold">Log in</h2>
        </div>
        <div className="p-6">
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="ornek@email.com"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember Me</label>
              </div>
              <div className="text-sm">
                <a href="#" className="text-blue-600 hover:text-blue-800">Forgot Password</a>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-blue-700 disabled:opacity-70 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
          <div className="mt-4 flex items-center gap-4">
            <span className="flex-1 border-t border-gray-300" />
            <span className="text-sm text-gray-500">or</span>
            <span className="flex-1 border-t border-gray-300" />
          </div>
          <div className="mt-4 flex justify-center" ref={googleButtonRef} />
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t you have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
