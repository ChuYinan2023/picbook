import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { Create } from './pages/Create';
import Login from './pages/Login';
import { Story } from './pages/Story';
import { MyStories } from './pages/MyStories';
import { authService } from './services/authService';

// 私有路由组件
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      <Navigation />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<Create />} />
        <Route path="/story/:id" element={
          <PrivateRoute>
            <Story />
          </PrivateRoute>
        } />
        <Route 
          path="/my-stories" 
          element={
            <PrivateRoute>
              <MyStories />
            </PrivateRoute>
          } 
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;