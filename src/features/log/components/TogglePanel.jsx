import React from 'react';

const TogglePanel = ({ onSignIn, onSignUp }) => (
  <div className="toggle-container">
    <div className="toggle">
      <div className="toggle-panel toggle-left">
        <h1>REGISTRARSE</h1>
        <p>¡Bienvenido a Delicias Darsy! Regístrate hoy y sé parte de una experiencia llena de sabor y calidad. </p>
        <small className="texto-informativo">¿Ya tienes cuenta?</small>
        <button className="hiddenn2" onClick={onSignIn}>Iniciar sesión</button>
      </div>
      <div className="toggle-panel toggle-right">
        <h1>INICIA SESIÓN</h1>
        <p>¡Bienvenido a Delicias Darsy! Endulza tu día iniciando sesión y descubre el sabor que alegra tus momentos. </p>
        <small className="texto-informativo">¿Aún no tienes cuenta?</small>
        <button className="hiddenn2" onClick={onSignUp}>Registrarse</button>
      </div>
    </div>
  </div>
);

export default TogglePanel;