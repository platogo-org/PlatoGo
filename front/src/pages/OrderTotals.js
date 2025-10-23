import React, { useState } from "react";
import axios from "axios";

const OrderTotals = () => {
  const [orderId, setOrderId] = useState("");
  const [tip, setTip] = useState(0);
  const [message, setMessage] = useState("");
  const [order, setOrder] = useState(null);

  const calculateTotals = async () => {
    console.log("ad");
    try {
      const response = await axios.post("/order/calculate-totals", {
        orderId,
        tip,
      });
      console.log(response);
      setMessage(
        response.data.message || "Totals calculated and order updated"
      );
      // Obtener la orden actualizada
      const orderRes = await axios.get(`/order/${orderId}`);
      setOrder(orderRes.data.data.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error calculating totals");
      setOrder(null);
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
      {order && (
        <div
          style={{
            marginTop: "30px",
            border: "1px solid #ccc",
            padding: "15px",
            borderRadius: "8px",
          }}
        >
          <h3>Order Summary</h3>
          <div>
            <b>Order ID:</b> {order._id}
          </div>
          <div>
            <b>Status:</b> {order.estado}
          </div>
          <div>
            <b>Products:</b>
          </div>
          <ul>
            {order.productos.map((item, idx) => (
              <li key={idx}>
                {item.product?.nombre || item.product?._id || "Producto"} -
                Cantidad: {item.quantity} - Precio: ${item.price}
              </li>
            ))}
          </ul>
          <div>
            <b>Subtotal:</b> ${order.subtotal}
          </div>
          <div>
            <b>Tax:</b> ${order.tax}
          </div>
          <div>
            <b>Tip:</b> ${order.tip}
          </div>
          <div>
            <b>Total:</b> ${order.total}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTotals;
