import React, { useState } from "react";
import axios from "axios";

const OrderTotals = () => {
  const [orderId, setOrderId] = useState("");
  const [tip, setTip] = useState(0);
  const [message, setMessage] = useState("");

  const calculateTotals = async () => {
    try {
      const response = await axios.post("/api/v1/orders/calculate-totals", {
        orderId,
        tip,
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error calculating totals");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Order Totals</h2>
      <input
        type="text"
        placeholder="Order ID"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        style={{ marginRight: "10px" }}
      />
      <input
        type="number"
        placeholder="Tip"
        value={tip}
        onChange={(e) => setTip(Number(e.target.value))}
        style={{ marginRight: "10px" }}
      />
      <button onClick={calculateTotals}>Calculate Totals</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default OrderTotals;
