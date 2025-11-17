import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import CategoryManager from "./CategoryManager";
import useSocket from "../hooks/useSocket";

const RestaurantAdminDashboard = () => {
  const { user, logout } = useAuth();
  const token = useMemo(
    () => localStorage.getItem("token") || "(no token)",
    []
  );
  const [tables, setTables] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedWaiter, setSelectedWaiter] = useState("");
  const [message, setMessage] = useState("");

  // Función para obtener mesas
  const fetchTables = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/table", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTables(response.data.data.tables || []);
    } catch (err) {
      console.error("Error al obtener mesas:", err);
    }
  }, []);

  // Manejadores de eventos WebSocket
  const eventHandlers = useMemo(
    () => ({
      mesa_actualizada: (data) => {
        console.log("🔄 Mesa actualizada:", data);
        setMessage(`Mesa ${data.mesaId} actualizada`);
        fetchTables();
      },
      mesaTransferida: (data) => {
        console.log("🔄 Mesa transferida:", data);
        setMessage(`Mesa transferida: ${data.mesaId}`);
        fetchTables();
      },
    }),
    [fetchTables]
  );

  // Usar el hook de socket
  const { connected } = useSocket({
    restaurantId: user?.restaurant,
    isKitchen: false,
    eventHandlers,
  });

  // Función para obtener meseros
  const fetchWaiters = useCallback(async () => {
    console.log("🔵 fetchWaiters INICIO");
    console.log("   - user:", user);
    console.log("   - user?.restaurant:", user?.restaurant);

    if (!user || !user.restaurant) {
      console.log("⚠️ Admin sin restaurante asignado - ABORTANDO");
      console.log("   - user existe?", !!user);
      console.log("   - user.restaurant existe?", !!user?.restaurant);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      console.log("🔍 Buscando meseros...");
      console.log("🏢 Restaurante del admin:", user.restaurant);

      const url = `/users/restaurant-waiters`;
      console.log("📡 URL de petición:", url);

      // Usar la ruta específica para restaurant-admin
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📋 Respuesta completa:", response);
      console.log("📋 response.data:", response.data);
      console.log("📋 response.data.data:", response.data.data);

      const waitersData = response.data.data?.waiters || [];

      console.log(`✅ ${waitersData.length} meseros encontrados`);
      console.log("👥 Meseros:", waitersData);

      setWaiters(waitersData);
      console.log("✅ setWaiters ejecutado con:", waitersData);
    } catch (err) {
      console.error("❌ Error al obtener meseros:", err);
      console.error("❌ Error response:", err.response);
      console.error("❌ Error response data:", err.response?.data);
    }
  }, [user]);

  useEffect(() => {
    console.log(
      "🟢 useEffect EJECUTADO - Llamando a fetchTables y fetchWaiters"
    );
    fetchTables();
    fetchWaiters();
  }, [fetchTables, fetchWaiters]);

  // Ejecutar fetchWaiters cuando user.restaurant cambie
  useEffect(() => {
    console.log("🟡 useEffect [user] ejecutado");
    console.log("   - user?.restaurant:", user?.restaurant);
    if (user?.restaurant) {
      console.log(
        "✅ Usuario con restaurante detectado, llamando fetchWaiters"
      );
      fetchWaiters();
    }
  }, [user, fetchWaiters]);

  // Log para debugging
  useEffect(() => {
    console.log("🔴 DEBUG - Estado actual:");
    console.log("   - user:", user);
    console.log("   - user.restaurant:", user?.restaurant);
    console.log("   - waiters.length:", waiters.length);
    console.log("   - waiters:", waiters);
    console.log("   - tables.length:", tables.length);
  }, [user, waiters, tables]);

  const handleAssign = async () => {
    console.log("🔴 handleAssign INICIO");
    console.log("   - selectedTable:", selectedTable);
    console.log("   - selectedWaiter:", selectedWaiter);

    if (!selectedTable || !selectedWaiter) {
      console.log("⚠️ Falta selección");
      setMessage("⚠️ Selecciona una mesa y un mesero");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = `/table/${selectedTable}/assign`;
      const payload = { waiterId: selectedWaiter };

      console.log("📡 Asignando mesa...");
      console.log("   - URL:", url);
      console.log("   - Payload:", payload);
      console.log("   - Token:", token ? "Existe" : "No existe");

      const response = await axios.patch(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Respuesta de asignación:", response.data);
      setMessage("✅ Mesa asignada exitosamente");
      setSelectedTable("");
      setSelectedWaiter("");
      fetchTables();
    } catch (err) {
      console.error("❌ Error asignando mesa:", err);
      console.error("❌ Error response:", err.response);
      console.error("❌ Error data:", err.response?.data);
      setMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>Restaurant Admin Dashboard</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => {
              console.log("🔴 BOTÓN MANUAL - Ejecutando fetchWaiters");
              fetchWaiters();
            }}
            style={{
              padding: "10px 20px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🔄 Cargar Meseros
          </button>
          <button
            onClick={logout}
            style={{
              padding: "10px 20px",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Indicador de conexión WebSocket */}
      <div
        style={{
          padding: "10px",
          background: connected ? "#d4edda" : "#f8d7da",
          color: connected ? "#155724" : "#721c24",
          borderRadius: "4px",
          marginBottom: "20px",
        }}
      >
        {connected ? "✅ Conectado en tiempo real" : "❌ Desconectado"}
      </div>

      {/* Sección de Asignación de Mesas */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
          background: "#f8f9fa",
        }}
      >
        <h3>Asignar Mesa a Mesero</h3>
        <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              <strong>Seleccionar Mesa:</strong>
            </label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="">-- Selecciona una mesa --</option>
              {tables.map((table) => (
                <option key={table._id} value={table._id}>
                  Mesa {table.numero} -{" "}
                  {table.assignedWaiter
                    ? `Asignada a: ${
                        waiters.find((w) => w._id === table.assignedWaiter)
                          ?.name || table.assignedWaiter
                      }`
                    : "Sin asignar"}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              <strong>Seleccionar Mesero:</strong>
            </label>
            <select
              value={selectedWaiter}
              onChange={(e) => setSelectedWaiter(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="">-- Selecciona un mesero --</option>
              {waiters.map((waiter) => (
                <option key={waiter._id} value={waiter._id}>
                  {waiter.name} ({waiter.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleAssign}
          disabled={!selectedTable || !selectedWaiter}
          style={{
            padding: "12px 30px",
            background: selectedTable && selectedWaiter ? "#28a745" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: selectedTable && selectedWaiter ? "pointer" : "not-allowed",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          Asignar Mesa
        </button>

        {message && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              background: message.includes("✅")
                ? "#d4edda"
                : message.includes("❌")
                ? "#f8d7da"
                : "#fff3cd",
              color: message.includes("✅")
                ? "#155724"
                : message.includes("❌")
                ? "#721c24"
                : "#856404",
              borderRadius: "4px",
            }}
          >
            {message}
          </div>
        )}
      </div>

      {/* Tabla de Mesas y Asignaciones */}
      <div style={{ marginBottom: "30px" }}>
        <h3>Estado de Mesas</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "white",
          }}
        >
          <thead>
            <tr style={{ background: "#007bff", color: "white" }}>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>
                Número de Mesa
              </th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>
                Capacidad
              </th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>
                Estado
              </th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>
                Mesero Asignado
              </th>
            </tr>
          </thead>
          <tbody>
            {tables.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    border: "1px solid #ddd",
                  }}
                >
                  No hay mesas registradas
                </td>
              </tr>
            ) : (
              tables.map((table) => (
                <tr key={table._id}>
                  <td
                    style={{
                      padding: "12px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                    }}
                  >
                    {table.numero}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                    }}
                  >
                    {table.capacidad} personas
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "4px",
                        background:
                          table.estado === "libre"
                            ? "#d4edda"
                            : table.estado === "ocupada"
                            ? "#fff3cd"
                            : "#cce5ff",
                        color:
                          table.estado === "libre"
                            ? "#155724"
                            : table.estado === "ocupada"
                            ? "#856404"
                            : "#004085",
                        fontWeight: "bold",
                      }}
                    >
                      {table.estado}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                    }}
                  >
                    {table.assignedWaiter
                      ? waiters.find((w) => w._id === table.assignedWaiter)
                          ?.name || table.assignedWaiter
                      : "Sin asignar"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Gestión de Categorías */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "8px",
          background: "#f8f9fa",
        }}
      >
        <CategoryManager onChange={useCallback(() => {}, [])} />
      </div>

      {/* Información de Debug (colapsable) */}
      <details style={{ marginTop: "30px" }}>
        <summary
          style={{
            cursor: "pointer",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          Ver información de usuario y token
        </summary>
        <div>
          <strong>User JSON:</strong>
          <pre
            style={{
              background: "#f4f4f4",
              padding: "12px",
              overflowX: "auto",
              borderRadius: "4px",
            }}
          >
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
        <div>
          <strong>Token:</strong>
          <pre
            style={{
              background: "#f4f4f4",
              padding: "12px",
              overflowX: "auto",
              borderRadius: "4px",
            }}
          >
            {token}
          </pre>
        </div>
      </details>
    </div>
  );
};

export default RestaurantAdminDashboard;
