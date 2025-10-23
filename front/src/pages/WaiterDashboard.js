import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const WaiterDashboard = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Welcome, {user.name}</h2>
      <p>Role: {user.role}</p>
      <div style={{ marginTop: "20px" }}>
        <h3>Actions</h3>
        <ul>
          <li>
            <Link to="/shift-management">Manage Shifts</Link>
          </li>
          <li>
            <Link to="/order-management">Manage Orders</Link>
          </li>
          <li>
            <Link to="/order-totals">Calculate Totals</Link>
          </li>
          <li>
            <Link to="/send-to-kitchen">Send to Kitchen</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default WaiterDashboard;
