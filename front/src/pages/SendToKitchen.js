import React, { useState } from "react";
import axios from "axios";

const SendToKitchen = () => {
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");

  const sendOrder = async () => {
    try {
      const response = await axios.post("/api/v1/orders/send-to-kitchen", {
        orderId,
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Error sending order to kitchen"
      );
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Send Order to Kitchen</h2>
      <input
        type="text"
        placeholder="Order ID"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        style={{ marginRight: "10px" }}
      />
      <button onClick={sendOrder}>Send to Kitchen</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SendToKitchen;
