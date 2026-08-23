import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

function AppContent() {
  const location = useLocation();

  // Show Navbar only on valid pages
  const showNavbar =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/admin/dashboard';

  return (
    <div className="app-root">

      {showNavbar && <Navbar />}

      <main className="main-content">
        <Routes>

          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Forgot Password */}
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          {/* Protected Admin Route */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </main>

    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;