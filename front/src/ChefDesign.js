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
        
        return { ...order, platillos: updatedPlatillos };
      }
      return order;
    });
    
    setOrders(updatedOrders);
  };

  // Remover platillo completado del desglose
  const removeFromDesglose = (platilloId) => {
    setCompletedItems(prev => prev.filter(item => item.id !== platilloId));
  };

  return (
    <div className="chef-app">
      {/* Header */}
      <div className="chef-header">
        <h1>COCINERO URIEL</h1>
      </div>

      {/* Main Content */}
      <div className="chef-content">
        {orders.map(order => (
          <div key={order.id} className="mesa-section">
            <div className="mesa-header">
              <div className="mesa-indicator"></div>
              <h2 className="mesa-title">MESA {order.mesa}</h2>
              <div className="mesa-line"></div>
            </div>
            
            <div className="platillos-grid">
              {order.platillos.map(platillo => (
                <div key={platillo.id} className="platillo-card">
                  <div className="platillo-image-container">
                    <img
                      src={platillo.image}
                      alt={platillo.name}
                      className="platillo-image"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/300x200/8B4513/FFFFFF?text=${encodeURIComponent(platillo.name)}`;
                      }}
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
                  {completedItems.map(item => (
                    <div key={`completed-${item.id}`} className="completed-item">
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
                      
                      <div className="completed-item-details">
                        <span className="completed-tiempo">Tiempo: {item.tiempo}</span>
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

export default ChefDesign;