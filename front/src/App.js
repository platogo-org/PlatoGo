import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginDesign from './LoginDesign';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import RestaurantAdminDashboard from './components/RestaurantAdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Login route */}
            <Route path="/login" element={<LoginDesign />} />
            
            {/* Protected Super Admin Dashboard */}
            <Route 
              path="/super-admin/dashboard" 
              element={
                <ProtectedRoute requiredRole="super-admin">
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Restaurant Admin Dashboard */}
            <Route 
              path="/restaurant/dashboard" 
              element={
                <ProtectedRoute requiredRole="restaurant-admin">
                  <RestaurantAdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Default redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Catch all other routes and redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;