import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Clear any legacy localStorage tokens to ensure window-close session expiration
  useEffect(() => {
    localStorage.removeItem('matel_token');
    localStorage.removeItem('matel_admin');
  }, []);

  // Use sessionStorage so session expires automatically when browser window is closed
  const [token, setToken] = useState(() => sessionStorage.getItem('matel_token') || null);
  const [admin, setAdmin] = useState(() => {
    const saved = sessionStorage.getItem('matel_admin');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setAdmin(res.data.admin);
            sessionStorage.setItem('matel_admin', JSON.stringify(res.data.admin));
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session check failed:', err);
          logout();
        }
      } else {
        setAdmin(null);
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token: jwtToken, admin: adminData } = response.data;
        setToken(jwtToken);
        setAdmin(adminData);
        sessionStorage.setItem('matel_token', jwtToken);
        sessionStorage.setItem('matel_admin', JSON.stringify(adminData));
        return { success: true, data: response.data };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        return { success: false, message: error.response.data.message };
      }
      if (error.code === 'ERR_NETWORK') {
        return { success: false, message: 'Unable to connect to the server.' };
      }
      return { success: false, message: 'Something went wrong. Please try again.' };
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    sessionStorage.removeItem('matel_token');
    sessionStorage.removeItem('matel_admin');
    localStorage.removeItem('matel_token');
    localStorage.removeItem('matel_admin');
  };

  return (
    <AuthContext.Provider value={{ token, admin, loading, login, logout, isAuthenticated: !!token && !!admin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
