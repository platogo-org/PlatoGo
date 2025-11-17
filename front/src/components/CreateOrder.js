import React, { useState } from "react";
import axios from "axios";

export default function CreateOrder({ onOrderCreated }) {
  const [restaurantId, setRestaurantId] = useState("");
  const [message, setMessage] = useState("");

  const handleCreate = async () => {
    if (!restaurantId) {
      setMessage("Please enter a restaurant ID");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/order",
        { restaurant: restaurantId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(res);
      onOrderCreated(res.data.data.data._id);
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Error creating order");
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <label>
        Restaurant ID:
        <input
          type="text"
          value={restaurantId}
          onChange={(e) => setRestaurantId(e.target.value)}
          style={{ marginLeft: "10px", marginRight: "10px" }}
        />
      </label>
      <button onClick={handleCreate} style={{ marginRight: "10px" }}>
        Crear orden
      </button>
      {message && (
        <span style={{ color: "red", marginLeft: "10px" }}>{message}</span>
      )}
    </div>
  );
}
