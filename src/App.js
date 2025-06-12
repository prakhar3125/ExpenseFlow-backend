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

function App() {
  return (
    <ThemeProvider> {/* Wrap with ThemeProvider */}
      <AuthProvider>
        <Router>
          <div className="App">
            <Navigation />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Authentication />} />
              
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
              
              {/* Default redirect to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* 404 route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
