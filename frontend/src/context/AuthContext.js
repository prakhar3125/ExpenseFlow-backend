import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// --- CHANGE HERE ---
// Import the specific `login` and `signup` functions from the api file.
// We use 'as' to give them different names (apiLogin, apiSignup) to avoid
// confusion with the login and signup functions defined in this component.
import { login as apiLogin, signup as apiSignup } from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // When the app loads, check for a token and validate it
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      try {
        const decodedUser = jwtDecode(savedToken);
        const isTokenExpired = decodedUser.exp * 1000 < Date.now();

        if (isTokenExpired) {
          console.log('Token is expired, logging out.');
          logout();
        } else {
          setToken(savedToken);
          // The 'sub' claim in your JWT holds the username (email)
          setUser({ email: decodedUser.sub }); 
        }
      } catch (error) {
        console.error("Failed to decode token", error);
        logout(); // Clear invalid token
      }
    }
    setLoading(false);
  }, []);

  // This is the login function passed to components via context
  const login = async (credentials) => {
    try {
      // --- CHANGE HERE ---
      // Call the imported apiLogin function directly
      const response = await apiLogin(credentials);

      const { token } = response;
      localStorage.setItem('token', token);
      setToken(token);

      const decodedUser = jwtDecode(token);
      setUser({ email: decodedUser.sub });
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  // This is the signup function passed to components via context
  const signup = async (credentials) => {
    try {
      // --- CHANGE HERE ---
      // Call the imported apiSignup function directly
      await apiSignup(credentials);
      return { success: true };
    } catch (error) {
      console.error('Signup failed:', error);
      return { success: false, error: error.message || 'Signup failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const value = {
    token,
    user,
    isAuthenticated: !!token, // A simple way to check if the user is authenticated
    login,
    signup,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};