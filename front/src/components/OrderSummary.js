import React, { useEffect, useState } from "react";
import axios from "axios";

export default function OrderSummary({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    axios
      .get(`/order/${orderId}`)
      .then((res) => {
        console.log("Orden recibida:", res.data.data.data);
        setOrder(res.data.data.data);
        setError("");
      })
      .catch((err) => {
        setError("Error loading order summary");
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (!orderId) return null;
  if (loading) return <div>Loading order summary...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
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
        {order.productos && order.productos.length > 0 ? (
          order.productos.map((item, idx) => (
            <li key={idx}>
              {item.product?.nombre ||
                item.product?._id ||
                item.product ||
                "Producto desconocido"}{" "}
              - Cantidad: {item.quantity} - Precio: ${item.price}
            </li>
          ))
        ) : (
          <li>No hay productos en esta orden</li>
        )}
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
  );
}
