import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const RestaurantAdminDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Panel de Gestión de Restaurante</h1>
        <button onClick={logout} className="logout-btn">
          Cerrar Sesión
        </button>
      </div>
      
      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>¡Bienvenido, {user?.name}!</h2>
          <p className="role-indicator">
            Has iniciado sesión como <strong>Administrador de Restaurante</strong>
          </p>
          <div className="user-info">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Rol:</strong> {user?.role}</p>
            <p><strong>Estado:</strong> Autenticado exitosamente</p>
            {user?.restaurant && (
              <p><strong>Restaurante:</strong> {user.restaurant}</p>
            )}
          </div>
        </div>
        
        <div className="dashboard-message">
          <h3>Acceso Autorizado</h3>
          <p>
            Esta es la pantalla del panel de gestión para Administradores de Restaurante. 
            Tienes acceso a la gestión específica de tu restaurante.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantAdminDashboard;