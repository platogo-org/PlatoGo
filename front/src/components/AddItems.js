import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AddItems({ orderId, onProductAdded }) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/product");
        console.log(res);
        const arr = Array.isArray(res.data.data)
          ? res.data.data
          : Array.isArray(res.data.data?.data)
          ? res.data.data.data
          : [];
        setProducts(arr);
      } catch (err) {
        setMessage("Error loading products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleProductChange = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const addItem = async () => {
    if (!orderId) {
      setMessage("Create an order first");
      return;
    }
    if (selectedProducts.length === 0) {
      setMessage("Select at least one product");
      return;
    }
    try {
      await Promise.all(
        selectedProducts.map((productId) =>
          axios.post("/order/add-item", {
            orderId,
            productId,
            quantity,
          })
        )
      );
      setMessage("Items added successfully");
      setSelectedProducts([]);

      // Notificar al padre que se agregaron productos
      if (onProductAdded) {
        onProductAdded();
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Error adding item");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h3>
        Current Order: <b>{orderId}</b>
      </h3>
      <div style={{ marginBottom: "10px" }}>
        <label>Products:</label>
        {loading ? (
          <span>Loading products...</span>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {products.map((product) => (
              <label key={product._id} style={{ marginRight: "15px" }}>
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product._id)}
                  onChange={() => handleProductChange(product._id)}
                />
                {product.nombre}
              </label>
            ))}
          </div>
        )}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <label>
          Quantity:
          <input
            type="number"
            value={quantity}
            min={1}
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={{ marginLeft: "10px" }}
          />
        </label>
      </div>
      <button onClick={addItem}>Add Item</button>
      {message && <p>{message}</p>}
    </div>
  );
}
