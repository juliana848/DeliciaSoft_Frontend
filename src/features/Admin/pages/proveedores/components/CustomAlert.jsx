import React from 'react';

const CustomAlert = ({ mensaje, tipo, visible, onClose }) => {
  if (!visible || !mensaje) return null;

  const estilos = {
    contenedor: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: tipo === 'success' ? '#d1fae5' : '#fee2e2',
      borderLeft: tipo === 'success' ? '4px solid #10b981' : '4px solid #ef4444',
      borderRadius: '8px',
      padding: '20px 24px',
      minWidth: '300px',
      maxWidth: '500px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 10000,
      animation: 'slideInRight 0.3s ease-out'
    },
    contenido: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    icono: {
      fontSize: '24px',
      flexShrink: 0
    },
    mensaje: {
      flex: 1,
      color: tipo === 'success' ? '#065f46' : '#991b1b',
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '1.5'
    },
    botonCerrar: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      color: tipo === 'success' ? '#065f46' : '#991b1b',
      cursor: 'pointer',
      padding: '0',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.6,
      transition: 'opacity 0.2s',
      flexShrink: 0
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { 
            transform: translateY(-20px);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      
      <div style={estilos.overlay} onClick={onClose}>
        <div style={estilos.contenedor} onClick={(e) => e.stopPropagation()}>
          <div style={estilos.contenido}>
            <span style={estilos.icono}>
              {tipo === 'success' ? '✅' : '❌'}
            </span>
            <span style={estilos.mensaje}>{mensaje}</span>
            <button 
              style={estilos.botonCerrar}
              onClick={onClose}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.6'}
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomAlert;