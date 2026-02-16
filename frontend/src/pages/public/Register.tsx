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
 * Register page (public). Username, email, password + Google OAuth.
 */
export function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const onSuccessRef = useRef<(data: authService.AuthResponse) => void>(() => {});
  onSuccessRef.current = (data) => {
    authLogin(data);
    navigate('/home', { replace: true });
  };
  const setErrorsRef = useRef(setErrors);
  setErrorsRef.current = setErrors;

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
        setErrors({});
        setLoading(true);
        authService
          .googleAuth(response.credential)
          .then((data) => onSuccessRef.current(data))
          .catch((err) => {
            setErrorsRef.current({ form: err?.message || 'Google sign-in failed' });
          })
          .finally(() => setLoading(false));
      },
    });
    window.google.accounts.id.renderButton(el, { type: 'standard', size: 'large', text: 'continue_with' });
  }, [googleReady]);

  // Handler for custom Google OAuth button
  const handleGoogleSignUp = () => {
    // Redirect to backend OAuth endpoint
    const backendUrl = import.meta.env?.VITE_BACKEND_URL || '';
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    else if (formData.username.length < 2) newErrors.username = 'Username must be at least 2 characters';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must accept the terms';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const data = await authService.register(formData.username.trim(), formData.email.trim(), formData.password);
      authLogin(data);
      navigate('/home', { replace: true });
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-indigo-600 p-6">
          <h2 className="text-center text-white text-3xl font-bold">Sign Up</h2>
        </div>
        <div className="p-6">
          {errors.form && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{errors.form}</div>}
          
          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            data-testid="google-signup-btn"
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                data-testid="register-username-input"
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600 ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="johndoe"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                data-testid="register-email-input"
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="ornek@email.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                data-testid="register-password-input"
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">Password (Again)</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                data-testid="register-confirm-password-input"
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
            <div className="mb-6">
              <div className="flex items-start">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  data-testid="register-agree-terms"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                />
                <label htmlFor="agreeTerms" className="ml-3 text-sm text-gray-700">
                  I accept the Terms of Service and Privacy Policy
                </label>
              </div>
              {errors.agreeTerms && <p className="text-red-500 text-xs mt-1">{errors.agreeTerms}</p>}
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                data-testid="register-submit-btn"
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
              >
                {loading ? 'Signing up...' : 'Sign Up'}
              </button>
            </div>
          </form>
          
          {/* Hidden div for Google Sign-In SDK button (fallback) */}
          <div className="mt-4 flex justify-center hidden" ref={googleButtonRef} />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Do you have already an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
