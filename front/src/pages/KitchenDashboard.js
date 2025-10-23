import React, { useState, useEffect, useCallback } from "react";
import useRealtimeSync from "../hooks/useRealtimeSync";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const KitchenDashboard = ({ restaurantId: propRestaurantId }) => {
  const [orders, setOrders] = useState([]);
  const [unavailableProducts, setUnavailableProducts] = useState([]);
  const { user } = useAuth();

  // Obtener restaurantId del usuario si no se pasa como prop
  const restaurantId = propRestaurantId || user?.restaurant;

  useEffect(() => {
    console.log("🍳 KitchenDashboard - restaurantId:", restaurantId);
    console.log("👤 Usuario:", user);
  }, [restaurantId, user]);

  // Callbacks para eventos en tiempo real
  const handlePedidoNuevo = useCallback((order) => {
    console.log("🆕 Nuevo pedido recibido:", order);
    setOrders((prev) => [order, ...prev]);
    // Notificación visual
    if (Notification.permission === "granted") {
      new Notification("Nuevo Pedido", {
        body: `Pedido #${order._id.slice(-6)} recibido`,
        icon: "/icon-order.png",
      });
    }
  }, []);

  const handlePedidoEnviadoACocina = useCallback((order) => {
    console.log("🍳 Pedido enviado a cocina:", order);
    // Agregar o actualizar en la lista
    setOrders((prev) => {
      const exists = prev.find((o) => o._id === order._id);
      if (exists) {
        return prev.map((o) => (o._id === order._id ? order : o));
      }
      return [order, ...prev];
    });
  }, []);

  const handlePedidoActualizado = useCallback((order) => {
    console.log("🔄 Pedido actualizado:", order);
    setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
  }, []);

  const handleProductoNoDisponible = useCallback((data) => {
    console.log("❌ Producto no disponible:", data);
    setUnavailableProducts((prev) => [...prev, data]);
    // Mostrar notificación
    alert(`⚠️ ${data.message}`);
    // Limpiar después de 5 segundos
    setTimeout(() => {
      setUnavailableProducts((prev) =>
        prev.filter((p) => p.productId !== data.productId)
      );
    }, 5000);
  }, []);

  // Usar el hook de sincronización en tiempo real
  const { connected, reconnecting, error } = useRealtimeSync({
    restaurantId,
    isKitchen: true,
    onPedidoNuevo: handlePedidoNuevo,
    onPedidoEnviadoACocina: handlePedidoEnviadoACocina,
    onPedidoActualizado: handlePedidoActualizado,
    onProductoNoDisponible: handleProductoNoDisponible,
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

      {/* Alerta de productos no disponibles */}
      {unavailableProducts.length > 0 && (
        <div style={{ marginTop: "15px" }}>
          {unavailableProducts.map((product, index) => (
            <div
              key={index}
              style={{
                padding: "10px",
                background: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: "4px",
                marginBottom: "10px",
              }}
            >
              ⚠️ <strong>{product.nombre || "Producto"}:</strong>{" "}
              {product.message}
            </div>
          ))}
        </div>
      )}

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
