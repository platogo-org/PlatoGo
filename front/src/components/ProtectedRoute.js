import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        fontSize: '18px',
        color: '#666'
      }}>
        Verificando autenticación...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization if specific role is required
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    const redirectPath = user.role === 'super-admin' 
      ? '/super-admin/dashboard' 
      : user.role === 'restaurant-admin' 
        ? '/restaurant/dashboard' 
        : '/login';
    
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;