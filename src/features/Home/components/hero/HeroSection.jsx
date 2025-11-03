import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleConocenos = () => {
    navigate('/conocenos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePedido = () => {
    navigate('/pedidos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            <button onClick={handleConocenos} className="btn btn-primary">
              Conócenos Más
            </button>
            <button onClick={handlePedido} className="btn btn-secondary">
              Hacer Pedido
            </button>
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