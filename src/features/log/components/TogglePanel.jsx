import React from 'react';
import '../login.css';

const TogglePanel = ({ onSignIn, onSignUp, hasDuplicates = false }) => (
  <div className="toggle-container">
    <div className="toggle">
      <div className="toggle-panel toggle-left">
        <h1>Registrarse</h1>
        <p>¡Bienvenido a Delicias Darsy! Regístrate hoy y sé parte de una experiencia llena de sabor y calidad. </p>
        <small className="texto-informativo">¿Ya tienes cuenta?</small>
        <button 
          className={`hiddenn2 ${hasDuplicates ? 'duplicate-glow-effect' : ''}`} 
          onClick={onSignIn}
        >
          Iniciar sesión
        </button>
      </div>
      <div className="toggle-panel toggle-right">
        <h1>Inicia sesión</h1>
        <p>¡Bienvenido a Delicias Darsy! Endulza tu día iniciando sesión y descubre el sabor que alegra tus momentos. </p>
        <small className="texto-informativo">¿Aún no tienes cuenta?</small>
        <button className="hiddenn2" onClick={onSignUp}>Registrarse</button>
      </div>
    </div>

    <style jsx>{`
      .duplicate-glow-effect {
        animation: glowPulse 2s ease-in-out infinite !important;
        box-shadow: 0 0 20px rgba(255, 88, 166, 0.8), 
                    0 0 40px rgba(255, 88, 166, 0.6), 
                    0 0 60px rgba(255, 88, 166, 0.4) !important;
        border: 2px solid rgba(255, 88, 166, 0.8) !important;
        background: linear-gradient(135deg, #ff58a6, #fc0278) !important;
        transform: scale(1.05) !important;
      }

      .duplicate-glow-effect:hover {
        animation: glowPulse 1s ease-in-out infinite !important;
        box-shadow: 0 0 25px rgba(255, 88, 166, 1), 
                    0 0 50px rgba(255, 88, 166, 0.8), 
                    0 0 75px rgba(255, 88, 166, 0.6) !important;
        transform: scale(1.08) !important;
      }

      @keyframes glowPulse {
        0%, 100% {
          box-shadow: 0 0 15px rgba(255, 88, 166, 0.6), 
                      0 0 30px rgba(255, 88, 166, 0.4), 
                      0 0 45px rgba(255, 88, 166, 0.2);
        }
        50% {
          box-shadow: 0 0 25px rgba(255, 88, 166, 1), 
                      0 0 50px rgba(255, 88, 166, 0.8), 
                      0 0 75px rgba(255, 88, 166, 0.6);
        }
      }
    `}</style>
  </div>
);

export default TogglePanel;