import React from "react";
import { useAuth } from "../contexts/AuthContext";
import TableBoard from "../components/TableBoard";

const WaiterDashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Extraer restaurantId y waiterId del usuario
  const restaurantId = user.restaurant || user.restaurantId;
  const waiterId = user._id || user.id;

  return (
    <div>
      {/* Renderizar el nuevo tablero de mesas con órdenes activas */}
      <TableBoard
        restaurantId={restaurantId}
        waiterId={waiterId}
      />
    </div>
  );
};

export default WaiterDashboard;
