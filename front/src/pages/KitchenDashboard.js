import React, { useState, useMemo, useEffect } from "react";
import useSocket from "../hooks/useSocket";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const KitchenDashboard = ({ restaurantId: propRestaurantId }) => {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();

  // Obtener restaurantId del usuario si no se pasa como prop
  const restaurantId = propRestaurantId || user?.restaurant;

  useEffect(() => {
    console.log("🍳 KitchenDashboard - restaurantId:", restaurantId);
    console.log("👤 Usuario:", user);
  }, [restaurantId, user]);

  // Manejadores de eventos WebSocket
  const eventHandlers = useMemo(
    () => ({
      testConnection: (data) => {
        console.log("🧪 TEST: Evento de prueba recibido:", data);
      },
      orderToKitchen: (order) => {
        console.log("✅ Orden recibida por websocket:", order);
        setOrders((prev) => [order, ...prev]);
      },
      orderStatusUpdated: (order) => {
        console.log("🔄 Estado de orden actualizado por WebSocket:", order);
        setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
      },
      joinedKitchen: (data) => {
        console.log("✅ Unido al canal de cocina:", data);
      },
    }),
    []
  );

  // Usar el hook de socket con reconexión automática
  const { connected, reconnecting, error } = useSocket({
    restaurantId,
    isKitchen: true,
    eventHandlers,
  });

  // Actualizar estado de una orden
  const updateOrderStatus = async (orderId, newStatus) => {
    console.log(
      `🔄 Intentando actualizar orden ${orderId} a estado: ${newStatus}`
    );

    try {
      // Actualización optimista en el UI (antes de la respuesta del servidor)
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, estado: newStatus } : o))
      );

      const token = localStorage.getItem("token");
      console.log(`📡 Enviando PATCH a /api/v1/orders/${orderId}/status`);
      console.log(`📦 Body: { estado: "${newStatus}" }`);

      const response = await axios.patch(
        `/order/${orderId}/status`,
        { estado: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(`✅ Respuesta del servidor:`, response.data);

      // Actualizar con la respuesta del servidor para asegurar consistencia
      if (response.data.data) {
        console.log(`🔄 Actualizando UI con datos del servidor`);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? response.data.data : o))
        );
      }
    } catch (err) {
      console.error("❌ Error al actualizar estado:", err);
      console.error(
        "❌ Detalles del error:",
        err.response?.data || err.message
      );
      alert(
        `Error al actualizar el estado de la orden: ${
          err.response?.data?.message || err.message
        }`
      );

      // Revertir la actualización optimista en caso de error
      // Podrías hacer un refetch aquí si es necesario
    }
  };

  // Indicador de conexión
  const ConnectionStatus = () => {
    if (reconnecting) {
      return (
        <div
          style={{ padding: "10px", background: "#fff3cd", color: "#856404" }}
        >
          🔄 Reconectando...
        </div>
      );
    }
    if (error) {
      return (
        <div
          style={{ padding: "10px", background: "#f8d7da", color: "#721c24" }}
        >
          ❌ Error: {error}
        </div>
      );
    }
    return (
      <div
        style={{
          padding: "10px",
          background: connected ? "#d4edda" : "#f8d7da",
          color: connected ? "#155724" : "#721c24",
        }}
      >
        {connected ? "✅ Conectado" : "❌ Desconectado"}
      </div>
    );
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Kitchen Dashboard</h2>
      <ConnectionStatus />
      <div style={{ marginTop: "20px" }}>
        <h3>Órdenes recibidas</h3>
        {orders.length === 0 ? (
          <p>No hay órdenes nuevas.</p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            {orders.map((order) => (
              <div
                key={order._id}
                style={{
                  border: "1px solid #ccc",
                  padding: "15px",
                  borderRadius: "8px",
                  backgroundColor:
                    order.estado === "preparing"
                      ? "#fff3cd"
                      : order.estado === "ready"
                      ? "#d4edda"
                      : "#fff",
                }}
              >
                <div style={{ marginBottom: "10px" }}>
                  <b>ID:</b> {order._id}
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <b>Estado:</b>{" "}
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      background:
                        order.estado === "preparing"
                          ? "#ffc107"
                          : order.estado === "ready"
                          ? "#28a745"
                          : "#6c757d",
                      color: "white",
                    }}
                  >
                    {order.estado}
                  </span>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <b>Productos:</b>
                  <ul style={{ marginTop: "5px" }}>
                    {order.productos.map((item, idx) => (
                      <li key={idx}>
                        {item.product?.nombre ||
                          item.product?._id ||
                          "Producto"}{" "}
                        x {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <b>Subtotal:</b> ${order.subtotal} | <b>Total:</b> $
                  {order.total}
                </div>
                <div
                  style={{ display: "flex", gap: "10px", marginTop: "10px" }}
                >
                  {order.estado === "preparing" && (
                    <button
                      onClick={() => updateOrderStatus(order._id, "ready")}
                      style={{
                        padding: "8px 16px",
                        background: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      ✅ Marcar como Lista
                    </button>
                  )}
                  {order.estado === "ready" && (
                    <button
                      onClick={() => updateOrderStatus(order._id, "delivered")}
                      style={{
                        padding: "8px 16px",
                        background: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      🚚 Marcar como Entregada
                    </button>
                  )}
                  <button
                    onClick={() => updateOrderStatus(order._id, "cancelled")}
                    style={{
                      padding: "8px 16px",
                      background: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    ❌ Cancelar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenDashboard;
