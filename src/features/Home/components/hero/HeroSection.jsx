import React from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-brand">Delicias Darsy</h1>
          <h2 className="heros-title">
            Endulza tus
            <br />
            momentos
            <br />
            <span className="hero-highlight">especiales</span>
          </h2>
          <p className="hero-description">
            Creamos postres únicos y deliciosos para hacer de cada
            <br />
            celebración un momento inolvidable. Desde pasteles
            <br />
            personalizados hasta dulces artesanales.
          </p>
          <div className="hero-buttons">
            <Link to="/cartas" className="btn btn-primary">
              Ver Productos
            </Link>
            <Link to="/pedidos" className="btn btn-secondary">
              Hacer Pedido
            </Link>
          </div>
        </div>
      </div>
      <div className="hero-image">
        {/* La imagen de fondo se maneja en CSS */}
      </div>
    </section>
  );
};

export default HeroSection;