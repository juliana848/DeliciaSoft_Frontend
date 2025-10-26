import React, { useState, useRef, useEffect } from 'react';

const Tooltip = ({ children, text }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (isVisible && buttonRef.current && tooltipRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      // Calcular posición arriba del botón
      let top = buttonRect.top - tooltipRect.height - 10;
      let left = buttonRect.left + (buttonRect.width / 2) - (tooltipRect.width / 2);
      
      // Si se sale por arriba, ponerlo abajo
      if (top < 0) {
        top = buttonRect.bottom + 10;
      }
      
      // Si se sale por la izquierda
      if (left < 10) {
        left = 10;
      }
      
      // Si se sale por la derecha
      if (left + tooltipRect.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width - 10;
      }
      
      setPosition({ top, left });
    }
  }, [isVisible]);

 const tooltipStyle = {
  position: 'fixed',
  top: `${position.top}px`,
  left: `${position.left}px`,
  backgroundColor: '#FFFFFF', // 🤍 Fondo blanco
  color: '#C2185B', // 💗 Texto rosa oscuro
  padding: '8px 14px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: '600',
  whiteSpace: 'nowrap',
  zIndex: 999999,
  boxShadow: '0 4px 10px rgba(233, 30, 99, 0.15)', // 💗 Sombra rosada suave
  border: '2px solid #F8BBD0', // 💗 Borde rosa pastel
  pointerEvents: 'none',
  opacity: isVisible ? 1 : 0,
  visibility: isVisible ? 'visible' : 'hidden',
  transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
  transform: isVisible ? 'translateY(0)' : 'translateY(5px)',
};


  return (
    <>
      <span
        ref={buttonRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        style={{ display: 'inline-block', position: 'relative' }}
      >
        {children}
      </span>
      
      {text && (
        <div ref={tooltipRef} style={tooltipStyle}>
          {text}
        </div>
      )}
    </>
  );
};

export default Tooltip;