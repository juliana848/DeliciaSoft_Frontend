import React from 'react';
import './modal.css';

// Componente Modal con cierre y contenido dinámico
const Modal = ({ children, onClose }) => {
  // Evita que el clic dentro del modal cierre la ventana
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    // Fondo del modal (clic afuera lo cierra)
    <div className="darsy-modal-overlay" onClick={onClose}>
      <div className="darsy-modal-container" onClick={handleContentClick}>
        <button className="darsy-modal-close-button" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div className="darsy-modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
