import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:3000";

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

  useEffect(() => {
    // Fetch tables and waiters
    axios.get("/api/v1/table").then((res) => setTables(res.data.data.tables));
    axios
      .get("/api/v1/users?role=restaurant-waiter")
      .then((res) => setWaiters(res.data.data.users || []));
    // Socket connection
    const socket = io(SOCKET_URL);
    socket.on("mesaTransferida", (data) => {
      setMessage(`Mesa transferida: ${data.mesaId}`);
      // Optionally refresh tables
      axios.get("/api/v1/table").then((res) => setTables(res.data.data.tables));
    });
    return () => socket.disconnect();
  }, []);

  const handleAssign = async () => {
    if (!selectedTable || !selectedWaiter) return;
    await axios.patch(`/api/v1/table/${selectedTable}/assign`, {
      waiterId: selectedWaiter,
    });
    setMessage("Transferencia realizada");
    axios.get("/api/v1/table").then((res) => setTables(res.data.data.tables));
  };

  return (
    <div style={{ fontFamily: "monospace", padding: "16px" }}>
      <h2>Restaurant Admin</h2>
      <button onClick={logout} style={{ marginBottom: "16px" }}>
        Logout
      </button>
      <div>
        <strong>User JSON:</strong>
        <pre
          style={{ background: "#f4f4f4", padding: "12px", overflowX: "auto" }}
        >
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
      <div>
        <strong>Token:</strong>
        <pre
          style={{ background: "#f4f4f4", padding: "12px", overflowX: "auto" }}
        >
          {token}
        </pre>
      </div>
      <div style={{ marginTop: 24 }}>
        <h3>Asignar/Transferir Mesa</h3>
        <div>
          <label>Mesa: </label>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
          >
            <option value="">Selecciona una mesa</option>
            {tables.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Mesero: </label>
          <select
            value={selectedWaiter}
            onChange={(e) => setSelectedWaiter(e.target.value)}
          >
            <option value="">Selecciona un mesero</option>
            {waiters.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleAssign} style={{ marginTop: 8 }}>
          Asignar/Transferir
        </button>
        {message && (
          <div style={{ color: "green", marginTop: 8 }}>{message}</div>
        )}
      </div>
    </div>
  );
};

export default RestaurantAdminDashboard;
