import React from 'react';

const TogglePanel = ({ onSignIn, onSignUp }) => (
  <div className="toggle-container">
    <div className="toggle">
      <div className="toggle-panel toggle-left">
        <h1>REGISTRARSE</h1>
        <p>¡Bienvenido a Delicias Darsy! Regístrate hoy y sé parte de una experiencia llena de sabor y calidad. </p>
        <small className="texto-informativo">¿ya tienes cuenta?</small>
        <button className="hidden" onClick={onSignIn}>Iniciar sesion</button>
      </div>
      <div className="toggle-panel toggle-right">
        <h1>INICIA SESION </h1>
        <p>¡¡Bienvenido a Delicias Darsy! Endulza tu día iniciando sesión y descubre el sabor que alegra tus momentos. </p>
        <small className="texto-informativo">¿Aún no tienes cuenta?</small>
        <button className="hidden" onClick={onSignUp}>Registrarse</button>
      </div>
    </div>
  </div>
);

export default TogglePanel;

