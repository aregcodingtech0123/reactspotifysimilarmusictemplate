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

// Google Icon SVG component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

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
    navigate('/home', { replace: true });
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

  // Handler for custom Google OAuth button
  const handleGoogleLogin = () => {
    // Redirect to backend OAuth endpoint
    const backendUrl = import.meta.env?.VITE_BACKEND_URL || '';
    window.location.href = `${backendUrl}/api/auth/google`;
  };

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
      navigate('/home', { replace: true });
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
          
          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            data-testid="google-login-btn"
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors mb-4 shadow-sm"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-4">
            <span className="flex-1 border-t border-gray-300" />
            <span className="text-sm text-gray-500">or</span>
            <span className="flex-1 border-t border-gray-300" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="login-email-input"
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
                data-testid="login-password-input"
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
                data-testid="login-submit-btn"
                className="w-full bg-cyan-500 hover:bg-blue-700 disabled:opacity-70 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
          
          {/* Hidden div for Google Sign-In SDK button (fallback) */}
          <div className="mt-4 flex justify-center hidden" ref={googleButtonRef} />
          
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
