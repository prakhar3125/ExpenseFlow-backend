// src/pages/Authentication.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { DollarSign, Eye, EyeOff, Loader2 } from 'lucide-react';

const Authentication = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup

  const { login, signup, user } = useAuth(); // Make sure signup is available in AuthContext
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/add-expense';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    let result;
    if (isLogin) {
      result = await login({ email, password });
    } else {
      result = await signup({ email, password });
    }

    if (result.success) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDarkMode
        ? 'bg-gradient-to-b from-slate-900 to-slate-800'
        : 'bg-gradient-to-b from-blue-50 to-indigo-100'
    }`}>
      <div className="max-w-md w-full">
        <div className={`rounded-xl shadow-lg p-8 ${
          isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
        }`}>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className={`p-3 rounded-full ${
                isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'
              }`}>
                <DollarSign className={`h-8 w-8 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
            </div>
            <h2 className={`text-2xl font-bold ${
              isDarkMode ? 'text-slate-100' : 'text-gray-800'
            }`}>{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
            <p className={`mt-2 ${
              isDarkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>{isLogin ? 'Sign in to your expense tracker' : 'Sign up to get started'}</p>
          </div>

          {/* Demo credentials - only show on login */}
          {isLogin && (
            <div className={`mb-6 p-4 rounded-lg border ${
              isDarkMode 
                ? 'bg-blue-900/20 border-blue-800/50' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <p className={`text-sm font-medium mb-2 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>Demo Credentials:</p>
              <p className={`text-xs ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>Email: user@example.com</p>
              <p className={`text-xs ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>Password: password</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className={`p-4 rounded-lg border ${
                isDarkMode
                  ? 'bg-red-900/20 border-red-800/50'
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={`text-sm ${
                  isDarkMode ? 'text-red-300' : 'text-red-600'
                }`}>{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDarkMode
                    ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-75 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-400'
                  }`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-offset-slate-800'
                  : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-offset-white'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {isLogin ? 'Signing in...' : 'Signing up...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Sign Up'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className={`text-sm font-medium underline hover:no-underline ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              {isLogin ? 'Create an account' : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authentication;
