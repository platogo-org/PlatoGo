import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import "./LoginDesign.css";

export default function LoginDesign() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const { login, error } = useAuth();
  const navigate = useNavigate();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Redirect based on user role
        const redirectPath =
          result.user.role === "super-admin"
            ? "/super-admin/dashboard"
            : result.user.role === "restaurant-admin"
            ? "/restaurant/dashboard"
            : result.user.role === "restaurant-waiter"
            ? "/waiter/dashboard"
            : "/";
        navigate(redirectPath);
      }
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para crear efecto ripple en botones
  const createRipple = (event) => {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);

    setTimeout(() => {
      circle.remove();
    }, 600);
  };

  const handleLoginClick = (event) => {
    event.preventDefault();
    createRipple(event);
    handleSubmit(event);
  };

  const handleSocialClick = (event, platform) => {
    createRipple(event);
    console.log(`${platform} button clicked`);
  };

  return (
    <div className="login-container">
      {/* Red gradient background */}
      <div className="red-background"></div>

      {/* Food images on the left */}
      <div className="food-images">
        <img
          src="/assets/images/pizza.png"
          alt="Pizza deliciosa"
          className="food-img pizza-img"
        />
        <img
          src="/assets/images/seafood.png"
          alt="Plato de mariscos"
          className="food-img seafood-img"
        />
        <img
          src="/assets/images/small-dish.png"
          alt="Plato pequeño"
          className="food-img small-dish-img"
        />
      </div>

      {/* White curved panel */}
      <div className="white-panel">
        {/* Login form section */}
        <div className="login-section">
          {/* Brand and avatar */}
          <div className="brand-header">
            <h1 className="brand-title">PLATOGO</h1>
            <div className="avatar-icon">
              <img src="/assets/icons/Avatar.svg" alt="User avatar" />
            </div>
          </div>

          {/* Form inputs */}
          <form onSubmit={handleSubmit} className="form-inputs">
            {error && <div className="error-message">{error}</div>}

            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="correo electrónico"
                className="login-input"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="input-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="contraseña"
                className="login-input"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="visibility-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                disabled={isLoading}
              >
                <img
                  src="/assets/icons/visibility.svg"
                  alt="Toggle password visibility"
                />
              </button>
            </div>

            <div className="forgot-password">¿olvidaste tu contraseña?</div>
          </form>

          {/* Login button */}
          <button
            className={`login-btn ${isLoading ? "loading" : ""}`}
            onClick={handleLoginClick}
            disabled={isLoading || !formData.email || !formData.password}
            type="submit"
          >
            <img src="/assets/icons/add-plus.svg" alt="Plus icon" />
            {isLoading ? "INICIANDO SESIÓN..." : "LOGIN"}
          </button>

          {/* Social buttons */}
          <div className="social-section">
            <button
              className="social-btn"
              onClick={(e) => handleSocialClick(e, "Google")}
            >
              <img src="/assets/icons/add-plus.svg" alt="Plus icon" />
              GOOGLE
            </button>
            <button
              className="social-btn"
              onClick={(e) => handleSocialClick(e, "Facebook")}
            >
              <img src="/assets/icons/add-plus.svg" alt="Plus icon" />
              FACEBOOK
            </button>
          </div>

          {/* Register link */}
          <div className="register-text">
            ¿no tienes cuenta? <strong>Registrarse</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
