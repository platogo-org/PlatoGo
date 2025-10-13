import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductForm = ({ product = null, onSaved, onCancel }) => {
  const [nombre, setNombre] = useState('');
  const [costo, setCosto] = useState('');
  const [restaurant, setRestaurant] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (product) {
      setNombre(product.nombre || '');
      setCosto(product.costo ?? '');
      setRestaurant(product.restaurant || '');
    } else {
      setNombre(''); setCosto(''); setRestaurant('');
    }
  }, [product]);

  const validate = () => {
    if (!nombre) return 'El nombre es obligatorio';
    if (costo === '' || isNaN(Number(costo))) return 'Costo inválido';
    if (!restaurant) return 'Restaurant es obligatorio';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    setLoading(true);
    setError(null);
    try {
      if (product && product._id) {
        await axios.patch(`/product/${product._id}`, { nombre, costo: Number(costo), restaurant });
        setSuccess('Producto actualizado');
      } else {
        await axios.post('/product', { nombre, costo: Number(costo), restaurant });
        setSuccess('Producto creado');
      }
      onSaved && onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="nombre-input">Nombre</label>
        <input id="nombre-input" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>
      <div>
        <label htmlFor="costo-input">Costo</label>
        <input id="costo-input" value={costo} onChange={(e) => setCosto(e.target.value)} />
      </div>
      <div>
        <label htmlFor="restaurant-input">Restaurant</label>
        <input id="restaurant-input" value={restaurant} onChange={(e) => setRestaurant(e.target.value)} />
      </div>
      <div style={{ marginTop: 8 }}>
        <button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
        <button type="button" onClick={onCancel} style={{ marginLeft: 8 }}>Cancelar</button>
      </div>
      {error && <div role="alert" style={{ color: 'red' }}>{error}</div>}
      {success && <div role="status" style={{ color: 'green' }}>{success}</div>}
    </form>
  );
};

export default ProductForm;
