import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpenCheck, LogOut } from 'lucide-react';
import { authService } from '../services/authService';

export function Navigation() {
  const navigate = useNavigate();
  const isLoggedIn = authService.isAuthenticated();
  const userPhone = localStorage.getItem('userPhone');

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpenCheck className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold text-indigo-600">StoryMagic</span>
          </Link>
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <span className="text-gray-700">{userPhone}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>退出</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}