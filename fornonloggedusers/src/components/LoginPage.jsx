import React, { useState } from 'react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill the empty inputs');
      return;
    }
    
    // Reset error if validation passes
    setError('');
    
    // Here you would typically handle the login request to your API
    console.log('Login attempt with:', { email, password, rememberMe });
    alert('Giriş denemesi: ' + email);
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                E-mail
              </label>
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
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
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember Me
                </label>
              </div>
              
              <div className="text-sm">
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  Forgot Password
                </a>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
              >
                Login
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't you have an account? {'  '}
              <a href="./SignUp" className="text-blue-600 hover:text-blue-800 font-medium">
                Create an account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;