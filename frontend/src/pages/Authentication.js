// src/pages/Authentication.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  DollarSign, 
  Eye, 
  EyeOff, 
  Loader2, 
  Mail, 
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const RupeeIcon = ({ size = 20, className = "" }) => (
  <div 
    className={`inline-flex items-center justify-center font-bold text-white ${className}`}
    style={{ fontSize: `${size}px`, width: `${size}px`, height: `${size}px` }}
  >
    ₹
  </div>
);

const Authentication = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false); // State for success message
  const [isLogin, setIsLogin] = useState(true);

  const { login, signup, user } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill in all required fields');
      return false;
    }
    
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // You can add more robust password validation here if needed
    // For now, your backend handles the main logic

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSignupSuccess(false);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await login({ email, password });
        if (!result.success) {
          setError(result.error || 'Authentication failed. Please try again.');
        }
        // The useEffect will handle navigation on successful login
      } else {
        // Handle Signup
        const result = await signup({ email, password });
        if (result.success) {
          // On successful signup, show a message and switch to login mode
          setSignupSuccess(true);
          setIsLogin(true);
          setPassword(''); // Clear password fields
          setConfirmPassword('');
        } else {
          setError(result.error || 'Signup failed. Please try again.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }

    setIsLoading(false);
  };

  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
    setError('');
    setSignupSuccess(false);
    setPassword('');
    setConfirmPassword('');
  };
  
  const features = [
    'Track expenses across multiple categories',
    'Generate detailed financial reports',
    'Set and monitor budget goals',
    'Secure cloud synchronization'
  ];

  return (
    <div className={`min-h-screen flex ${
      isDarkMode
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Left Panel - Features */}
      <div className={`hidden lg:flex lg:w-1/2 p-12 flex-col justify-center ${
        isDarkMode ? 'bg-slate-900/50' : 'bg-gradient-to-br from-blue-600 to-indigo-700'
      }`}>
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className={`p-3 rounded-2xl ${
  isDarkMode ? 'bg-blue-600' : 'bg-white/20'
}`}>
  <RupeeIcon size={40} className={
    isDarkMode ? 'text-white' : 'text-white'
  } />
</div>

            <div>
              <h1 className={`text-3xl font-bold ${
                isDarkMode ? 'text-white' : 'text-white'
              }`}>ExpenseFlow</h1>
              <div className="flex items-center gap-1 mt-1">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className={`text-sm ${
                  isDarkMode ? 'text-slate-300' : 'text-blue-100'
                }`}>Professional Finance Tracker</span>
              </div>
            </div>
          </div>

          <h2 className={`text-4xl font-bold mb-6 leading-tight ${
            isDarkMode ? 'text-white' : 'text-white'
          }`}>
            Take Control of Your Financial Journey
          </h2>

          <p className={`text-xl mb-8 leading-relaxed ${
            isDarkMode ? 'text-slate-300' : 'text-blue-100'
          }`}>
            Join thousands of professionals who trust ExpenseFlow to manage their finances 
            with precision and insight.
          </p>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className={`h-5 w-5 flex-shrink-0 ${
                  isDarkMode ? 'text-green-400' : 'text-green-300'
                }`} />
                <span className={`${
                  isDarkMode ? 'text-slate-300' : 'text-blue-100'
                }`}>{feature}</span>
              </div>
            ))}
          </div>

          <div className={`mt-8 p-4 rounded-xl ${
            isDarkMode ? 'bg-slate-800/50' : 'bg-white/10'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 ${
                    isDarkMode ? 'bg-slate-600 border-slate-800' : 'bg-white/20 border-white/40'
                  }`} />
                ))}
              </div>
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-slate-300' : 'text-blue-100'
              }`}>Trusted by 10,000+ users</span>
            </div>
            <p className={`text-sm ${
              isDarkMode ? 'text-slate-400' : 'text-blue-200'
            }`}>
              "ExpenseFlow transformed how I manage my business expenses. Highly recommended!"
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Authentication Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className={`p-3 rounded-2xl ${
  isDarkMode ? 'bg-blue-600' : 'bg-blue-600'
}`}>
  <RupeeIcon size={32} className="text-white" />
</div>
              <h1 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>ExpenseFlow</h1>
            </div>
          </div>

          <div className={`rounded-2xl shadow-2xl p-8 ${
            isDarkMode 
              ? 'bg-slate-800/80 backdrop-blur-sm border border-slate-700/50' 
              : 'bg-white/80 backdrop-blur-sm border border-white/50'
          }`}>
            <div className="text-center mb-8">
              <h2 className={`text-3xl font-bold mb-2 ${
                isDarkMode ? 'text-slate-100' : 'text-gray-900'
              }`}>
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className={`${
                isDarkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>
                {isLogin 
                  ? 'Sign in to access your financial dashboard' 
                  : 'Join ExpenseFlow and start managing your finances professionally'
                }
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Signup Success Message */}
              {signupSuccess && (
                <div className={`p-4 rounded-xl border-l-4 ${
                  isDarkMode
                    ? 'bg-green-900/20 border-green-500 text-green-300'
                    : 'bg-green-50 border-green-500 text-green-700'
                }`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <p className="text-sm font-medium">Account created! Please sign in to continue.</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className={`p-4 rounded-xl border-l-4 ${
                  isDarkMode
                    ? 'bg-red-900/20 border-red-500 text-red-300'
                    : 'bg-red-50 border-red-500 text-red-700'
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                      <Mail className={`h-5 w-5 ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        isDarkMode
                          ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                      <Lock className={`h-5 w-5 ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        isDarkMode
                          ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-75 transition-opacity ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-400'
                      }`}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                        <Lock className={`h-5 w-5 ${
                          isDarkMode ? 'text-slate-400' : 'text-gray-400'
                        }`} />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          isDarkMode
                            ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-75 transition-opacity ${
                          isDarkMode ? 'text-slate-400' : 'text-gray-400'
                        }`}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white focus:ring-offset-slate-800'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white focus:ring-offset-white'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className={`text-sm ${
                isDarkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </p>
              <button
                type="button"
                onClick={handleModeSwitch}
                className={`mt-2 text-sm font-semibold hover:underline transition-colors ${
                  isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                {isLogin ? 'Create a free account' : 'Sign in instead'}
              </button>
            </div>

            {!isLogin && (
              <div className={`mt-6 text-center text-xs ${
                isDarkMode ? 'text-slate-500' : 'text-gray-500'
              }`}>
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authentication;