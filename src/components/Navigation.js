import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus, BarChart3, User } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';
const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (location.pathname === '/auth' || !user) {
    return null;
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-800">Expense Tracker</h1>
            
            <div className="hidden md:flex space-x-4">
  <Link
    to="/add-expense"
    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
      location.pathname === '/add-expense'
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-600 hover:text-gray-900'
    }`}
  >
    <Plus size={18} />
    Add Expense
  </Link>
  
  <Link
    to="/dashboard"
    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
      location.pathname === '/dashboard'
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-600 hover:text-gray-900'
    }`}
  >
    <BarChart3 size={18} />
    Dashboard
  </Link>
</div>

          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User size={16} />
              <span>{user.name || user.email}</span>
            </div>
            <DarkModeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 rounded-md"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
