import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';
import './ClientDesign.css';

const ClientDesign = () => {
  // Datos de los productos
  const products = [
    {
      id: 1,
      name: 'Chile en Nogada',
      price: 120,
      category: 'México',
      image: '/assets/images/cards/chile.png'
    },
    {
      id: 2,
      name: 'Enchiladas',
      price: 70,
      category: 'México',
      image: '/assets/images/cards/enchiladas.png'
    },
    {
      id: 3,
      name: 'Sopes',
      price: 60,
      category: 'México',
      image: '/assets/images/cards/sopes.png'
    },
    {
      id: 4,
      name: 'Tacos',
      price: 50,
      category: 'México',
      image: '/assets/images/cards/tacos.png'
    },
    {
      id: 5,
      name: 'Paella Mixta',
      price: 180,
      category: 'España',
      image: '/assets/images/cards/paella.png'
    },
    {
      id: 6,
      name: 'Rodajas de Jamón Ibérico',
      price: 150,
      category: 'España',
      image: '/assets/images/cards/jamon.png'
    },
    {
      id: 7,
      name: 'Polbo a feira',
      price: 80,
      category: 'España',
      image: '/assets/images/cards/polbo.png'
    },
    {
      id: 8,
      name: 'Fabada asturiana',
      price: 65,
      category: 'España',
      image: '/assets/images/cards/fabada.png'
    },
    {
      id: 9,
      name: 'Schweinebraten',
      price: 140,
      category: 'Alemania',
      image: '/assets/images/cards/schweine.png'
    },
    {
      id: 10,
      name: 'Spätzle',
      price: 90,
      category: 'Alemania',
      image: '/assets/images/cards/spatzle.png'
    },
    {
        id: 11,
        name: 'Rouladen',
        price: 75,
        category: 'Alemania',
        image: '/assets/images/cards/rouladen.png'
    },
    {
        id: 12,
        name: 'Königsberger Klopse',
        price: 55,
        category: 'Alemania',
        image: '/assets/images/cards/koni.png'
    }
  ];

  const categories = ['TODAS', 'MEJORES', 'MÉXICO', 'ESPAÑA', 'ALEMANIA'];
  
  const [selectedCategory, setSelectedCategory] = useState('TODAS');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // Filtrar productos por categoría
  const filteredProducts = selectedCategory === 'TODAS' 
    ? products 
    : selectedCategory === 'MEJORES'
    ? products.filter(p => p.price > 100)
    : products.filter(p => p.category.toUpperCase() === selectedCategory);

  // Agrupar productos por categoría para mostrar
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  // Funciones del carrito
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId, change) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="restaurant-app">
      {/* Header */}
      <div className="header">
        <h1>MESA 2</h1>
        
        {/* Categories */}
        <div className="categories-container">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="content">
        {Object.entries(groupedProducts).map(([category, products]) => (
          <div key={category} className="category-section">
            <div className="category-header">
              <div className="category-indicator"></div>
              <h2 className="category-title">{category}</h2>
              <div className="category-line"></div>
            </div>
            
            <div className="products-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image-container">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                    />
                  </div>
                  <div className="product-details-new">
                    <h3 className="product-name-large">{product.name}</h3>
                    <div className="product-row">
                      <p className="product-price-large">${product.price}</p>
                      <button
                        onClick={() => addToCart(product)}
                        className="add-plus-btn">
                        <span className="add-text">ADD</span>
                        <span className="plus-icon"><Plus size={24} /></span>
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
      <div className="bottom-bar">
        <div className="language-selector">
          <span className="language-text">ESP</span>
          <div className="language-arrow"></div>
        </div>
        
        <button
          onClick={() => setShowCart(true)}
          className="cart-btn"
        >
          <ShoppingCart size={20} />
          <span>Ver carrito</span>
          {getTotalItems() > 0 && (
            <span className="cart-count">
              {getTotalItems()}
            </span>
          )}
        </button>
      </div>

      {/* Cart Overlay */}
      {showCart && (
        <div className="cart-overlay">
          <div className="cart-panel">
            <div className="cart-header">
              <div className="cart-header-content">
                <h2 className="cart-title">DESGLOSE</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="close-btn"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="cart-content">
              {cart.length === 0 ? (
                <p className="empty-cart">Tu carrito está vacío</p>
              ) : (
                <>
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-header">
                        <h3 className="cart-item-name">{item.name}</h3>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="remove-item-btn"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      
                      <div className="cart-item-controls">
                        <div className="quantity-controls">
                          <button
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className="quantity-btn"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="quantity-display">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className="quantity-btn"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <span className="item-total">${item.price * item.quantity}</span>
                      </div>
                    </div>
                  ))}

                  <div className="checkout-section">
                    <button className="checkout-btn">
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <div className="checkout-icon"></div>
                        <span>Pagar</span>
                      </div>
                      <span>${getTotalPrice()}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDesign;