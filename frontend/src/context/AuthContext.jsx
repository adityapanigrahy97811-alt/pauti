import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('mandal_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('mandal_token') || null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user and settings on load
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            setSettings(res.data.settings);
            localStorage.setItem('mandal_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.error('Session validation error:', error);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', { username, password });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('mandal_token', newToken);
        localStorage.setItem('mandal_user', JSON.stringify(newUser));
        toast.success(`स्वागत आहे, ${newUser.name}! 🙏`);
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('mandal_token');
    localStorage.removeItem('mandal_user');
    toast.success('Logged out successfully. || गणपती बाप्पा मोरया ||');
  };

  const refreshMe = async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setSettings(res.data.settings);
        localStorage.setItem('mandal_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('refreshMe error:', err);
    }
  };

  const value = {
    user,
    token,
    settings,
    loading,
    login,
    logout,
    refreshMe,
    isAdmin: user?.role === 'ADMIN',
    isTreasurer: user?.role === 'TREASURER' || user?.role === 'ADMIN',
    isCollector: user?.role === 'COLLECTOR',
    hasRole: (roles) => roles.includes(user?.role)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
