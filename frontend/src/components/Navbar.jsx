import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiTrendingUp, FiLogOut, FiLock } from 'react-icons/fi';

const Navbar = () => {
  const { isAuthenticated, admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {isAuthenticated ? (
          <div className="brand-logo">
            <div className="logo-icon-box">
              <FiTrendingUp className="logo-icon" />
            </div>
            <div className="brand-text">
              <span className="brand-title">MATEL</span>
              <span className="brand-subtitle">AUTO FINANCE</span>
            </div>
          </div>
        ) : (
          <Link to="/" className="brand-logo">
            <div className="logo-icon-box">
              <FiTrendingUp className="logo-icon" />
            </div>
            <div className="brand-text">
              <span className="brand-title">MATEL</span>
              <span className="brand-subtitle">AUTO FINANCE</span>
            </div>
          </Link>
        )}

        <nav className="navbar-nav">
          {isAuthenticated ? (
            <div className="nav-user-controls">
              <button onClick={handleLogout} className="btn btn-outline-danger btn-sm logout-btn">
                <FiLogOut /> Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/login" className="btn btn-primary login-nav-btn">
                <FiLock className="btn-icon" /> Login
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
