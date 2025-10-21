import React, { useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CategoryManager from './CategoryManager';

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
      <CategoryManager onChange={useCallback(() => {}, [])} />
    </div>
  );
};

export default RestaurantAdminDashboard;
