import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:4000";

const KitchenDashboard = ({ restaurantId }) => {
  const [orders, setOrders] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    console.log("Conectando socket a:", SOCKET_URL);
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Socket conectado, ID:", socket.id);
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket desconectado");
      setConnected(false);
    });

    socket.on("orderToKitchen", (order) => {
      console.log("✅ Orden recibida por websocket:", order);
      setOrders((prev) => [order, ...prev]);
    });

    socket.on("connect_error", (error) => {
      console.error("Error de conexión:", error);
    });

    return () => {
      console.log("Limpiando socket...");
      socket.disconnect();
    };
  }, []); // Sin dependencias para que solo se conecte una vez

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Kitchen Dashboard</h2>
      <div>Estado conexión: {connected ? "Conectado" : "Desconectado"}</div>
      <div style={{ marginTop: "20px" }}>
        <h3>Órdenes recibidas</h3>
        {orders.length === 0 ? (
          <p>No hay órdenes nuevas.</p>
        ) : (
          <ul>
            {orders.map((order) => (
              <li
                key={order._id}
                style={{
                  marginBottom: "15px",
                  border: "1px solid #ccc",
                  padding: "10px",
                  borderRadius: "6px",
                }}
              >
                <div>
                  <b>ID:</b> {order._id}
                </div>
                <div>
                  <b>Estado:</b> {order.estado}
                </div>
                <div>
                  <b>Productos:</b>
                </div>
                <ul>
                  {order.productos.map((item, idx) => (
                    <li key={idx}>
                      {item.product?.nombre || item.product?._id || "Producto"}{" "}
                      x {item.quantity}
                    </li>
                  ))}
                </ul>
                <div>
                  <b>Subtotal:</b> ${order.subtotal}
                </div>
                <div>
                  <b>Total:</b> ${order.total}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default KitchenDashboard;
