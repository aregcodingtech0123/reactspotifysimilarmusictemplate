import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

/**
 * Contact page: auth-aware form.
 * Logged-in: message only. Not logged-in: email + message.
 * Submits to POST /api/contact (NestJS on 4001 or set VITE_API_URL).
 */
export function Contact() {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const body = isAuthenticated
        ? { message: message.trim() }
        : { message: message.trim(), email: email.trim() };
      const result = await apiRequest<{ id: string; createdAt: string }>('/api/contact', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (result.ok) {
        setSuccessMessage("Message sent! We'll get back to you soon.");
        setMessage('');
        setEmail('');
      } else {
        setErrorMessage(result.error.message || 'Failed to send message.');
      }
    } catch {
      setErrorMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121826] text-white p-4 md:p-8">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Contact</h1>
          <p className="text-gray-400">Send us a message. We’ll get back to you as soon as we can.</p>
        </div>

        {/* Form card - matches Login form style (white card on dark bg for consistency in layout) */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700/50">
          <div className="p-6 md:p-8">
            {successMessage && (
              <div className="mb-4 p-3 bg-green-900/50 text-green-300 rounded border border-green-700">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded border border-red-700">
                {errorMessage}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              {!isAuthenticated && (
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="contact-email">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              )}
              <div className={!isAuthenticated ? 'mb-6' : 'mb-6'}>
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="contact-message">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-[120px]"
                  placeholder="Your message..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-150"
              >
                {loading ? 'Sending...' : 'Send message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
