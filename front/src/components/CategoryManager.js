import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CategoryManager = ({ onChange }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/category');
      const data = res.data?.data?.data || res.data?.data || [];
      setList(data);
    } catch (err) {
      setError('No se pudieron cargar las categorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createOrUpdate = async () => {
    if (!name) return setError('Nombre requerido');
    try {
      if (editingId) {
        await axios.patch(`/category/${editingId}`, { nombre: name });
      } else {
        await axios.post('/category', { nombre: name });
      }
      setName(''); setEditingId(null); setError(null);
      await load();
      onChange && onChange();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const remove = async (id) => {
    if (!confirm('Eliminar categoria?')) return;
    try {
      await axios.delete(`/category/${id}`);
      await load();
      onChange && onChange();
    } catch (err) {
      setError('No se pudo eliminar');
    }
  };

  const startEdit = (c) => { setEditingId(c._id); setName(c.nombre); };

  return (
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6, marginTop: 16 }}>
      <h3>Gestionar Categorías</h3>
      <div style={{ marginBottom: 8 }}>
        <input placeholder="Nombre de categoría" value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={createOrUpdate} style={{ marginLeft: 8 }}>{editingId ? 'Actualizar' : 'Crear'}</button>
        {editingId && <button onClick={() => { setEditingId(null); setName(''); }} style={{ marginLeft: 8 }}>Cancelar</button>}
      </div>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {loading ? <div>Cargando...</div> : (
        <ul>
          {list.map((c) => (
            <li key={c._id} style={{ marginBottom: 6 }}>
              <strong>{c.nombre}</strong>
              <button onClick={() => startEdit(c)} style={{ marginLeft: 8 }}>Editar</button>
              <button onClick={() => remove(c._id)} style={{ marginLeft: 8 }}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoryManager;
