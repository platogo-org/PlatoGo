import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import useSocket from "../hooks/useSocket";
import axios from "axios";

const WaiterDashboard = ({ restaurantId, waiterId }) => {
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);

  // Manejadores de eventos WebSocket
  const eventHandlers = useMemo(
    () => ({
      mesaTransferida: (data) => {
        console.log("🔄 Mesa transferida:", data);
        // Actualizar lista de mesas
        fetchTables();
      },
      mesaEstadoActualizado: (data) => {
        console.log("🔄 Estado de mesa actualizado:", data);
        setTables((prev) =>
          prev.map((table) =>
            table._id === data.mesaId
              ? { ...table, estado: data.estado }
              : table
          )
        );
      },
      orderStatusChanged: (order) => {
        console.log("🔄 Estado de orden actualizado:", order);
        setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
      },
      pedido_nuevo: (order) => {
        console.log("🆕 Nueva orden recibida:", order);
        fetchOrders(); // Recargar todas las órdenes
      },
      pedido_actualizado: (order) => {
        console.log("🔄 Orden actualizada:", order);
        setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
      },
      joinedRestaurant: (data) => {
        console.log("✅ Unido al canal del restaurante:", data);
        fetchTables();
        fetchOrders();
      },
      joinedWaiter: (data) => {
        console.log("✅ Unido al canal del mesero:", data);
      },
    }),
    []
  );

  // Usar el hook de socket con reconexión automática
  const { connected, reconnecting, error } = useSocket({
    restaurantId,
    waiterId,
    isKitchen: false,
    eventHandlers,
  });

  // Obtener mesas
  const fetchTables = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/table", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("📋 Respuesta de mesas:", response.data);
      setTables(response.data.data.tables || []);
    } catch (err) {
      console.error("Error al obtener mesas:", err);
    }
  };

  // Obtener órdenes
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/order", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("📋 Respuesta de órdenes:", response.data);

      // Obtener el array de órdenes correctamente
      const ordersData =
        response.data.data?.orders ||
        response.data.data?.data ||
        response.data.data ||
        [];

      console.log(`✅ ${ordersData.length} órdenes encontradas`);
      setOrders(ordersData);
    } catch (err) {
      console.error("Error al obtener órdenes:", err);
      console.error("Detalles:", err.response?.data);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    console.log("🚀 WaiterDashboard montado");
    console.log("📍 restaurantId:", restaurantId);
    console.log("👤 waiterId:", waiterId);
    fetchTables();
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, waiterId]);

  // Recargar datos cuando el componente vuelva a estar visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("🔄 Dashboard visible de nuevo, recargando datos...");
        fetchTables();
        fetchOrders();
      }
    };

    const handleFocus = () => {
      console.log("🔄 Ventana enfocada, recargando datos...");
      fetchTables();
      fetchOrders();
    };

    // Escuchar cuando la pestaña vuelve a estar visible
    document.addEventListener("visibilitychange", handleVisibilityChange);
    // Escuchar cuando la ventana vuelve a tener foco
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cambiar estado de mesa
  const changeTableState = async (tableId, newState) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/table/${tableId}/state`,
        { estado: newState },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(`✅ Estado de mesa actualizado a: ${newState}`);
    } catch (err) {
      console.error("Error al cambiar estado de mesa:", err);
      alert("Error al cambiar el estado de la mesa");
    }
  };

  // Indicador de conexión
  const ConnectionStatus = () => {
    if (reconnecting) {
      return (
        <div
          style={{
            padding: "10px",
            background: "#fff3cd",
            color: "#856404",
            borderRadius: "4px",
            marginBottom: "15px",
          }}
        >
          🔄 Reconectando...
        </div>
      );
    }
    if (error) {
      return (
        <div
          style={{
            padding: "10px",
            background: "#f8d7da",
            color: "#721c24",
            borderRadius: "4px",
            marginBottom: "15px",
          }}
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
          borderRadius: "4px",
          marginBottom: "15px",
        }}
      >
        {connected ? "✅ Conectado en tiempo real" : "❌ Desconectado"}
      </div>
    );
  };

  // Obtener color según estado de mesa
  const getTableColor = (estado) => {
    switch (estado) {
      case "libre":
        return "#d4edda";
      case "ocupada":
        return "#fff3cd";
      case "cuenta":
        return "#cce5ff";
      default:
        return "#f8f9fa";
    }
  };

  // Obtener color según estado de orden
  const getOrderColor = (estado) => {
    switch (estado) {
      case "pending":
        return "#f8f9fa";
      case "preparing":
        return "#fff3cd";
      case "ready":
        return "#d4edda";
      case "delivered":
        return "#cce5ff";
      case "cancelled":
        return "#f8d7da";
      default:
        return "#f8f9fa";
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Dashboard del Mesero</h2>
      <ConnectionStatus />

      {/* Sección de Acciones Rápidas */}
      <div
        style={{
          marginBottom: "30px",
          padding: "15px",
          background: "#f8f9fa",
          borderRadius: "8px",
        }}
      >
        <h3>Acciones Rápidas</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => {
              fetchTables();
              fetchOrders();
            }}
            style={{
              padding: "10px 20px",
              background: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🔄 Refrescar Datos
          </button>
          <Link
            to="/shift-management"
            style={{
              padding: "10px 20px",
              background: "#007bff",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            📋 Gestionar Turnos
          </Link>
          <Link
            to="/order-management"
            style={{
              padding: "10px 20px",
              background: "#28a745",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            📝 Gestionar Órdenes
          </Link>
          <Link
            to="/order-totals"
            style={{
              padding: "10px 20px",
              background: "#ffc107",
              color: "#000",
              textDecoration: "none",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            💰 Calcular Totales
          </Link>
          <Link
            to="/send-to-kitchen"
            style={{
              padding: "10px 20px",
              background: "#17a2b8",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            🍳 Enviar a Cocina
          </Link>
        </div>
      </div>

      {/* Sección de Mesas */}
      <div style={{ marginBottom: "30px" }}>
        <h3>Mis Mesas Asignadas</h3>
        <p style={{ fontSize: "12px", color: "#666" }}>
          Total de mesas: {tables.length} | Mis mesas:{" "}
          {
            tables.filter(
              (table) => String(table.assignedWaiter) === String(waiterId)
            ).length
          }
        </p>
        {tables.length === 0 ? (
          <div
            style={{
              padding: "20px",
              background: "#fff3cd",
              borderRadius: "8px",
            }}
          >
            <p>⚠️ No se encontraron mesas en el sistema.</p>
            <p style={{ fontSize: "14px", marginTop: "10px" }}>
              Verifica que existan mesas creadas en la base de datos.
            </p>
          </div>
        ) : tables.filter(
            (table) => String(table.assignedWaiter) === String(waiterId)
          ).length === 0 ? (
          <div
            style={{
              padding: "20px",
              background: "#d1ecf1",
              borderRadius: "8px",
            }}
          >
            <p>ℹ️ No tienes mesas asignadas actualmente.</p>
            <p style={{ fontSize: "14px", marginTop: "10px" }}>
              Tu ID: <strong>{waiterId}</strong>
            </p>
            <details style={{ marginTop: "10px" }}>
              <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                Ver todas las mesas ({tables.length})
              </summary>
              <ul style={{ marginTop: "10px" }}>
                {tables.map((table) => (
                  <li
                    key={table._id}
                    style={{ fontSize: "12px", marginBottom: "5px" }}
                  >
                    Mesa {table.numero} - Asignada a:{" "}
                    {table.assignedWaiter || "Nadie"}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "15px",
            }}
          >
            {tables
              .filter(
                (table) => String(table.assignedWaiter) === String(waiterId)
              )
              .map((table) => (
                <div
                  key={table._id}
                  style={{
                    border: "1px solid #ccc",
                    padding: "15px",
                    borderRadius: "8px",
                    backgroundColor: getTableColor(table.estado),
                  }}
                >
                  <div style={{ marginBottom: "10px" }}>
                    <b>Mesa:</b> {table.numero}
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <b>Capacidad:</b> {table.capacidad} personas
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <b>Estado:</b> {table.estado}
                  </div>
                  <div
                    style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}
                  >
                    <button
                      onClick={() => changeTableState(table._id, "libre")}
                      disabled={table.estado === "libre"}
                      style={{
                        padding: "6px 12px",
                        background:
                          table.estado === "libre" ? "#ccc" : "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor:
                          table.estado === "libre" ? "not-allowed" : "pointer",
                      }}
                    >
                      Libre
                    </button>
                    <button
                      onClick={() => changeTableState(table._id, "ocupada")}
                      disabled={table.estado === "ocupada"}
                      style={{
                        padding: "6px 12px",
                        background:
                          table.estado === "ocupada" ? "#ccc" : "#ffc107",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor:
                          table.estado === "ocupada"
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      Ocupada
                    </button>
                    <button
                      onClick={() => changeTableState(table._id, "cuenta")}
                      disabled={table.estado === "cuenta"}
                      style={{
                        padding: "6px 12px",
                        background:
                          table.estado === "cuenta" ? "#ccc" : "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor:
                          table.estado === "cuenta" ? "not-allowed" : "pointer",
                      }}
                    >
                      Cuenta
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Sección de Órdenes */}
      <div>
        <h3>Órdenes</h3>
        <p style={{ fontSize: "12px", color: "#666" }}>
          Total de órdenes: {orders.length}
        </p>
        {orders.length === 0 ? (
          <div
            style={{
              padding: "20px",
              background: "#d1ecf1",
              borderRadius: "8px",
            }}
          >
            <p>ℹ️ No tienes órdenes activas.</p>
          </div>
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
                  backgroundColor: getOrderColor(order.estado),
                }}
              >
                <div style={{ marginBottom: "10px" }}>
                  <b>ID Orden:</b> {order._id}
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
                          : order.estado === "delivered"
                          ? "#007bff"
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
                    {order.productos?.map((item, idx) => (
                      <li key={idx}>
                        {item.product?.nombre || "Producto"} x {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <b>Total:</b> ${order.total}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WaiterDashboard;
