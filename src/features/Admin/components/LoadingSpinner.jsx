import React from 'react';
import muñequita from './muñequita.gif';

export default function LoadingSpinner() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(6px)'
    }}>
      
      {/* Muñequita */}
      <div style={{
        marginBottom: '1.5rem',
        animation: 'float 3s ease-in-out infinite'
      }}>
        <img 
          src={muñequita} 
          alt="Cargando..." 
          style={{ width: '300px', height: '300px' }}
        />
      </div>
      
      {/* Texto */}
      <p style={{
        color: '#d81b60',
        fontSize: '22px',
        fontWeight: '600',
        marginBottom: '1.5rem',
        fontFamily: 'Arial, sans-serif',
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        Cargando...
      </p>
      
      {/* Barra de carga */}
      <div style={{
        width: '280px',
        height: '8px',
        backgroundColor: 'rgba(240, 240, 240, 0.6)',
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '50%',
          background: 'linear-gradient(90deg, #f48fb1, #ec407a, #ff69b4, #ec407a, #f48fb1)',
          backgroundSize: '200% 100%',
          borderRadius: '20px',
          animation: 'loadingBar 2s ease-in-out infinite, shimmer 3s linear infinite'
        }}/>
      </div>

      {/* Animaciones */}
      <style>
        {`
          @keyframes loadingBar {
            0% { left: -50%; }
            50% { left: 100%; }
            100% { left: -50%; }
          }
          
          @keyframes shimmer {
            0% { background-position: 0% 0%; }
            100% { background-position: 200% 0%; }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}
      </style>
    </div>
  );
}
