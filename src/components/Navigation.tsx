import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenCheck } from 'lucide-react';

export function Navigation() {
  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpenCheck className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold text-indigo-600">StoryMagic</span>
          </Link>
          <div className="flex space-x-4">
            <button className="px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
              登录
            </button>
            <button className="px-4 py-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors">
              注册
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}