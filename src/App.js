// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // ✅ This should exist
import ProtectedRoute from './components/ProtectedRoute'; // ✅ Create this
import Navigation from './components/Navigation'; // ✅ Create this
import AddExpense from './pages/AddExpense'; // ✅ From paste.txt
import Dashboard from './pages/Dashboard'; // ✅ From paste-2.txt (NOT ExpenseDashboard)
import Authentication from './pages/Authentication'; // ✅ Create this
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            {/* Public Routes */}
            <Route path="/auth" element={<Authentication />} />
            
            {/* Protected Routes */}
            <Route path="/add-expense" element={
              <ProtectedRoute>
                <AddExpense />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
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
  );
}

export default App;
