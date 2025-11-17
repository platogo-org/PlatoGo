import React from "react";
import { useAuth } from "../contexts/AuthContext";
import WaiterDashboardComponent from "../components/WaiterDashboard";

const WaiterDashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Extraer restaurantId y waiterId del usuario
  const restaurantId = user.restaurant || user.restaurantId;
  const waiterId = user._id || user.id;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Bienvenido, {user.name}</h2>
      <p>Rol: {user.role}</p>

      {/* Renderizar el dashboard completo con mesas y órdenes */}
      <WaiterDashboardComponent
        restaurantId={restaurantId}
        waiterId={waiterId}
      />
    </div>
  );
};

export default WaiterDashboard;
