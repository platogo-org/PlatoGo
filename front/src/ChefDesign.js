<<<<<<< HEAD
import React, { useState } from 'react';
import { Eye, CheckCircle } from 'lucide-react';
import './ChefDesign.css';

const ChefDesign = () => {
  // Datos de los platillos por mesa
  const [orders, setOrders] = useState([
    {
      id: 1,
      mesa: 1,
      platillos: [
        {
          id: 1,
          name: 'Chile en Nogada',
          tiempo: '1:30',
          image: '/assets/images/cards/chile.png',
          terminado: false
        },
        {
          id: 2,
          name: 'Enchiladas',
          tiempo: '1:20',
          image: '/assets/images/cards/enchiladas.png',
          terminado: false
        },
        {
          id: 3,
          name: 'Sopes',
          tiempo: '1:26',
          image: '/assets/images/cards/sopes.png',
          terminado: false
        },
        {
          id: 4,
          name: 'Tacos',
          tiempo: '1:31',
          image: '/assets/images/cards/tacos.png',
          terminado: false
        }
      ]
    },
    {
      id: 2,
      mesa: 2,
      platillos: [
        {
          id: 5,
          name: 'Paella Mixta',
          tiempo: '2:15',
          image: '/assets/images/cards/paella.png',
          terminado: false
        },
        {
          id: 6,
          name: 'Rodajas de Jamón Ibérico',
          tiempo: '0:45',
          image: '/assets/images/cards/jamon.png',
          terminado: false
        },
        {
          id: 7,
          name: 'Polbo a feira',
          tiempo: '1:55',
          image: '/assets/images/cards/polbo.png',
          terminado: false
        },
        {
          id: 8,
          name: 'Fabada asturiana',
          tiempo: '2:30',
          image: '/assets/images/cards/fabada.png',
          terminado: false
        }
      ]
    }
  ]);

  const [showDesglose, setShowDesglose] = useState(false);
  const [completedItems, setCompletedItems] = useState([]);

  // Marcar platillo como terminado
  const markAsCompleted = (mesaId, platilloId) => {
    const updatedOrders = orders.map(order => {
      if (order.id === mesaId) {
        const updatedPlatillos = order.platillos.map(platillo => {
          if (platillo.id === platilloId) {
            const completedPlatillo = { ...platillo, terminado: true, mesa: order.mesa };
            setCompletedItems(prev => [...prev, completedPlatillo]);
            return null; // Remover del array original
          }
          return platillo;
        }).filter(Boolean); // Filtrar elementos null
        
=======
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Eye, CheckCircle } from "lucide-react";
import "./ChefDesign.css";

const ChefDesign = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDesglose, setShowDesglose] = useState(false);
  const [completedItems, setCompletedItems] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/v1/order"); // Cambiar URL según la API
        console.log("Response Data:", response.data);
        const ordersWithImages = response.data.data.data.map((order) => ({
          ...order,
          platillos: order.productos.map((producto) => ({
            ...producto,
            image: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880`,
          })),
        }));
        setOrders(ordersWithImages);
      } catch (err) {
        setError("Error al cargar los pedidos.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Marcar platillo como terminado
  const markAsCompleted = (mesaId, platilloId) => {
    const updatedOrders = orders.map((order) => {
      if (order.id === mesaId) {
        const updatedPlatillos = order.platillos
          .map((platillo) => {
            if (platillo.id === platilloId) {
              const completedPlatillo = {
                ...platillo,
                terminado: true,
                mesa: order.mesa,
              };
              setCompletedItems((prev) => [...prev, completedPlatillo]);
              return null; // Remover del array original
            }
            return platillo;
          })
          .filter(Boolean); // Filtrar elementos null

>>>>>>> master
        return { ...order, platillos: updatedPlatillos };
      }
      return order;
    });
<<<<<<< HEAD
    
=======

>>>>>>> master
    setOrders(updatedOrders);
  };

  // Remover platillo completado del desglose
  const removeFromDesglose = (platilloId) => {
<<<<<<< HEAD
    setCompletedItems(prev => prev.filter(item => item.id !== platilloId));
  };

=======
    setCompletedItems((prev) => prev.filter((item) => item.id !== platilloId));
  };

  if (loading) {
    return <div className="loading">Cargando pedidos...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

>>>>>>> master
  return (
    <div className="chef-app">
      {/* Header */}
      <div className="chef-header">
        <h1>COCINERO URIEL</h1>
      </div>

      {/* Main Content */}
      <div className="chef-content">
<<<<<<< HEAD
        {orders.map(order => (
=======
        {orders.map((order) => (
>>>>>>> master
          <div key={order.id} className="mesa-section">
            <div className="mesa-header">
              <div className="mesa-indicator"></div>
              <h2 className="mesa-title">MESA {order.mesa}</h2>
              <div className="mesa-line"></div>
            </div>
<<<<<<< HEAD
            
            <div className="platillos-grid">
              {order.platillos.map(platillo => (
=======

            <div className="platillos-grid">
              {order.platillos.map((platillo) => (
>>>>>>> master
                <div key={platillo.id} className="platillo-card">
                  <div className="platillo-image-container">
                    <img
                      src={platillo.image}
                      alt={platillo.name}
                      className="platillo-image"
<<<<<<< HEAD
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/300x200/8B4513/FFFFFF?text=${encodeURIComponent(platillo.name)}`;
                      }}
=======
>>>>>>> master
                    />
                  </div>
                  <div className="platillo-status">
                    <div className="platillo-info-row">
                      <h3 className="platillo-name">{platillo.name}</h3>
                      <p className="platillo-tiempo">{platillo.tiempo}</p>
                    </div>
                    <div className="platillo-btn-row">
                      <button
                        onClick={() => markAsCompleted(order.id, platillo.id)}
                        className="terminado-btn"
                      >
                        <CheckCircle size={16} />
                        <span>TERMINADO</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="chef-bottom-bar">
        <div className="language-selector">
          <span className="language-text">ESP</span>
          <div className="language-arrow"></div>
        </div>
<<<<<<< HEAD
        
        <button
          onClick={() => setShowDesglose(true)}
          className="desglose-btn"
        >
          <Eye size={20} />
          <span>Ver desglose</span>
          {completedItems.length > 0 && (
            <span className="desglose-count">
              {completedItems.length}
            </span>
=======

        <button onClick={() => setShowDesglose(true)} className="desglose-btn">
          <Eye size={20} />
          <span>Ver desglose</span>
          {completedItems.length > 0 && (
            <span className="desglose-count">{completedItems.length}</span>
>>>>>>> master
          )}
        </button>
      </div>

      {/* Desglose Overlay */}
      {showDesglose && (
        <div className="desglose-overlay">
          <div className="desglose-panel">
            <div className="desglose-header">
              <div className="desglose-header-content">
                <h2 className="desglose-title">PLATILLOS TERMINADOS</h2>
                <button
                  onClick={() => setShowDesglose(false)}
                  className="close-btn"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="desglose-content">
              {completedItems.length === 0 ? (
                <p className="empty-desglose">No hay platillos terminados</p>
              ) : (
                <>
<<<<<<< HEAD
                  {completedItems.map(item => (
                    <div key={`completed-${item.id}`} className="completed-item">
=======
                  {completedItems.map((item) => (
                    <div
                      key={`completed-${item.id}`}
                      className="completed-item"
                    >
>>>>>>> master
                      <div className="completed-item-header">
                        <h3 className="completed-item-name">{item.name}</h3>
                        <span className="completed-mesa">Mesa {item.mesa}</span>
                        <button
                          onClick={() => removeFromDesglose(item.id)}
                          className="remove-completed-btn"
                        >
                          ×
                        </button>
                      </div>
<<<<<<< HEAD
                      
                      <div className="completed-item-details">
                        <span className="completed-tiempo">Tiempo: {item.tiempo}</span>
=======

                      <div className="completed-item-details">
                        <span className="completed-tiempo">
                          Tiempo: {item.tiempo}
                        </span>
>>>>>>> master
                        <span className="completed-status">✓ Terminado</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

<<<<<<< HEAD
export default ChefDesign;
=======
export default ChefDesign;
>>>>>>> master
