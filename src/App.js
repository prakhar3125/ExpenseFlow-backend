// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; // Add this import
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import AddExpense from './pages/AddExpense';
import Dashboard from './pages/Dashboard';
import Authentication from './pages/Authentication';
import './App.css';

// src/App.js
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navigation />
            <Routes>
              {/* Public Routes - Change /login to /auth */}
              <Route path="/auth" element={<Authentication />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/add-expense" element={
                <ProtectedRoute>
                  <AddExpense />
                </ProtectedRoute>
              } />
              
              {/* Default redirect to auth page */}
              <Route path="/" element={<Navigate to="/auth" replace />} />
              
              {/* 404 route - redirect to auth */}
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}


export default App;
