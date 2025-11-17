import React, { useState } from "react";
import CreateOrder from "../components/CreateOrder";
import AddItems from "../components/AddItems";
import OrderSummary from "../components/OrderSummary";

export default function OrderManagement() {
  const [orderId, setOrderId] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleProductAdded = () => {
    setRefreshKey((prev) => prev + 1); // Incrementar para forzar re-render
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Order Management</h2>
      {!orderId ? (
        <CreateOrder onOrderCreated={setOrderId} />
      ) : (
        <>
          <AddItems orderId={orderId} onProductAdded={handleProductAdded} />
          <OrderSummary orderId={orderId} key={refreshKey} />
        </>
      )}
    </div>
  );
}
