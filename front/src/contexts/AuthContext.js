import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configure axios defaults
  axios.defaults.baseURL = 'http://localhost:3000/api/v1';
  axios.defaults.withCredentials = true;

  // Check if user is already authenticated on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // Try to get user info to verify token is still valid
          const response = await axios.get('/users/me');
          setUser(response.data.data.user);
        }
      } catch (error) {
        // Token is invalid or expired
        logout();
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post('/users/login', {
        email,
        password
      });

      const { token, data } = response.data;
      const user = data.user;

      // Store token
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user in state
      setUser(user);
      
      // Return user for redirection logic
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setError(null);
  };

  const getRedirectPath = (user) => {
    if (!user || !user.role) return '/login';
    
    switch (user.role) {
      case 'super-admin':
        return '/super-admin/dashboard';
      case 'restaurant-admin':
        return '/restaurant/dashboard';
      default:
        return '/login';
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    getRedirectPath,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'super-admin',
    isRestaurantAdmin: user?.role === 'restaurant-admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};