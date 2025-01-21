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
            {isLoggedIn && (
              <Link
                to="/my-stories"
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full 
                  bg-gradient-to-r from-indigo-50 to-blue-50 
                  text-indigo-700 hover:from-indigo-100 hover:to-blue-100 
                  transition-all duration-300 ease-in-out
                  border border-indigo-100/50 shadow-sm hover:shadow-md"
              >
                <BookOpenCheck className="h-4 w-4" />
                <span className="text-sm font-medium">我的作品</span>
              </Link>
            )}

            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 text-sm">{userPhone}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-full 
                    bg-gray-100 text-gray-700 
                    hover:bg-gray-200 hover:text-gray-900
                    transition-colors duration-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">退出</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full 
                    bg-indigo-600 text-white 
                    hover:bg-indigo-700 
                    transition-colors text-sm"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full 
                    bg-pink-500 text-white 
                    hover:bg-pink-600 
                    transition-colors text-sm"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}