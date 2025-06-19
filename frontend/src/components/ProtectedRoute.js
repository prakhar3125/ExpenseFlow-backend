import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react'; // Optional: for a loading indicator

const ProtectedRoute = ({ children }) => {
  // Destructure isAuthenticated and loading from our updated AuthContext
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // 1. While the context is loading, show a spinner or nothing
  //    This prevents a redirect before the token has been verified.
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }

  // 2. Once loading is complete, check for authentication
  if (!isAuthenticated) {
    // Redirect them to the /auth page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after a
    // successful login.
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // 3. If authenticated, render the child components
  return children;
};

export default ProtectedRoute;