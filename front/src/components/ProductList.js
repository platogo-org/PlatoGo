import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductList = ({ onEdit }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/product');
      setProducts(res.data.data || res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar la lista');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      setError(null);
      setSuccess(null);
      await axios.delete(`/product/${id}`);
      setSuccess('Producto desactivado');
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo desactivar');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div role="alert">{error}</div>;

  return (
    <div>
      <h3>Productos</h3>
      <button onClick={fetchProducts}>Refrescar</button>
      {success && <div role="status" style={{ color: 'green' }}>{success}</div>}
      {error && <div role="alert" style={{ color: 'red' }}>{error}</div>}
      <ul>
        {products.map((p) => (
          <li key={p._id} style={{ opacity: p.active === false ? 0.5 : 1 }}>
            <strong>{p.nombre}</strong> — ${p.costo}
            {' '}
            {p.active === false && <em>(inactivo)</em>}
            <button onClick={() => onEdit(p)} style={{ marginLeft: 8 }}>Editar</button>
            <button onClick={() => handleDeactivate(p._id)} style={{ marginLeft: 8 }}>Desactivar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
